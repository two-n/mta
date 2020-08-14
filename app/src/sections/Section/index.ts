import { Store } from 'redux';
import { select, Selection } from 'd3';
import 'intersection-observer';
import scrollama from 'scrollama';
import * as A from '../../redux/actions/creators';
import { SectionDataType, State } from '../../utils/types';
import './style.scss';
import { CLASSES as C, SECTIONS as S, KEYS } from '../../utils/constants';
import { getSectionHash } from '../../utils/helpers';

interface Props { data: SectionDataType,
  store: Store,
  sectionName: string }
/** Scaffolding for reusable section code */
export default class Section {
  store: Store<State>

  data: SectionDataType;

  scroller: any;

  el: Selection;

  sticky:Selection;

  graphic:Selection;

  steps: Selection;

  section: string;

  header: any;

  constructor({ data, store, sectionName }: Props) {
    this.store = store;
    this.data = data;
    this.scroller = scrollama();
    this.section = sectionName;
    this.onStepEnter = this.onStepEnter.bind(this);
    this.onStepExit = this.onStepExit.bind(this);
  }

  init() {
    // add elements to page
    this.setUpSection();

    // will be different/overwritten for each instance
    this.setUpGraphic();

    // force a resize on load to ensure proper dimensions are sent to scrollama
    this.handleResize();

    // setup scroller
    this.setUpScroller();
  }

  setUpScroller() {
    this.scroller.setup({
      step: `#${this.section} .${C.STEP}`,
      progress: true,
      offset: 0.6, // how far from the top to trigger a step
    })
      .onStepEnter(this.onStepEnter)
      .onStepProgress(this.onStepProgress)
      .onStepExit(this.onStepExit);
  }

  onStepEnter({ element, index, direction }) {
    // console.log('enter: element, index, direction', element, index, direction);
    // const data = select(element).data()[0] as StepDataType;
    this.steps.classed(C.ACTIVE, false);
    select(element).classed(C.ACTIVE, true);

    // update url as we scroll
    this.store.dispatch(A.setLocation(element.getAttribute(KEYS.DATA_STEP)));
    select(element).classed(C.ACTIVE, true);
  }

  onStepProgress({ element, index, progress }) {
    // console.log('progress: element, index, progress', element, index, progress);
    // select(element).classed(C.ACTIVE, progress < fadeOutThreshold && progress > fadeInThreshold);
  }

  onStepExit({ element, index, direction }) {
    // console.log('exit: element, index, direction', element, index, direction);
    // select(element).classed(C.ACTIVE, false);
    // this.header
    //   .classed(C.FADE_IN, false);// remove class to allow css animation to be re-triggered
  }

  setUpSection() {
    const { data } = this;
    // the same for each section
    this.el = select('#app').append('section')
      .attr('id', `${this.section}`) /** unique to section */
      .attr('class', C.SECTION);

    // create graphic container
    this.sticky = this.el.append('div')
      .attr('class', C.STICKY);

    // create header
    this.header = this.sticky.append('div').attr('class', C.SECTION_HEADER)
      .html(data.title);

    // create header
    this.graphic = this.sticky.append('div')
      .attr('class', C.GRAPHIC); /** unique to section */

    // create steps
    this.steps = this.el
      .append('div')
      .attr('class', C.ARTICLE)
      .selectAll(`.${C.STEP}`).data(data.steps)
      .join('div')
      .attr('class', C.STEP)
      .attr(KEYS.DATA_STEP, (d) => getSectionHash(this.section, d.step_id));

    this.steps.selectAll('.text')
      .data((d) => [d])
      .join('div')
      .attr('class', 'text')
      .classed('empty', (d) => !d.text)
      .classed('vertical-center', (d) => d.isMiddle) // for headings that should be in the middle
      .html((d) => d.text)
      .filter((d) => d.subtitle)
      .selectAll(C.SUBTITLE)
      .data((d) => [d.subtitle])
      .join('div')
      .attr('class', C.SUBTITLE)
      .html((d) => d);
  }

  setUpGraphic() {
    // will be different for each instance
  }

  // generic window resize listener event
  handleResize() {
    // 1. update height of step elements
    const stepH = Math.floor(window.innerHeight) * 0.7;
    this.steps.style('height', `${stepH}px`);

    const figureHeight = window.innerHeight;
    const figureMarginTop = (window.innerHeight - figureHeight) / 2;

    this.sticky
      .style('height', `${figureHeight}px`)
      .style('top', `${figureMarginTop}px`);

    // 3. tell scrollama to update new element dimensions
    this.scroller.resize();
  }
}
