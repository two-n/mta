import { Store } from 'redux';
import { select, Selection } from 'd3-selection';
import 'intersection-observer';
import scrollama from 'scrollama';
import { SectionDataType, State } from '../../utils/types';
import './style.scss';
import { CLASSES as C, SECTIONS as S } from '../../utils/constants';

interface Props { data: SectionDataType, store: Store }

export default class Section1 {
  store: Store<State>

  data: SectionDataType;

  scroller: any;

  el: Selection;

  sticky:Selection;

  steps: Selection;

  constructor({ data, store }: Props) {
    this.store = store;
    this.data = data;
    this.scroller = scrollama();
  }

  init() {
    // add elements to page
    this.setUpSection();

    // force a resize on load to ensure proper dimensions are sent to scrollama
    this.handleResize();

    // setup scroller
    this.setUpScroller();
  }

  setUpScroller() {
    this.scroller.setup({
      step: `#${S.S1} .${C.STEP}`,
    })
      .onStepEnter(this.onStepEnter)
      .onStepExit(this.onStepExit);
  }

  onStepEnter({ element, index, direction }) {
    console.log('step enter', element, index, direction);
  }

  onStepExit({ element, index, direction }) {

  }

  setUpSection() {
    const { data } = this;

    // create section
    this.el = select(`#${S.S1}`) /** unique to section */
      .attr('class', C.SECTION);

    // create graphic container
    this.sticky = this.el.append('div')
      .attr('class', C.STICKY);

    // create header
    this.sticky.append('h2').attr('class', C.SECTION_HEADER)
      .html(data.title);

    // create header
    this.sticky.append('div')
      .attr('class', C.GRAPHIC); /** unique to section */

    // create steps
    this.steps = this.el
      .append('div')
      .attr('class', C.ARTICLE)
      .selectAll(`.${C.STEP}`).data(data.steps)
      .join('div')
      .attr('class', C.STEP)
      .attr('data-step', (d) => d.step_id);

    this.steps.append('h3')
      .attr('class', C.STEP_HEADER)
      .html((d) => d.header);

    this.steps.append('div')
      .attr('class', C.STEP_TEXT)
      .html((d) => d.text);
  }

  // generic window resize listener event
  handleResize() {
    // 1. update height of step elements
    const stepH = Math.floor(window.innerHeight * 0.75);
    this.steps.style('height', `${stepH}px`);

    const figureHeight = window.innerHeight / 2;
    const figureMarginTop = (window.innerHeight - figureHeight) / 2;

    this.sticky
      .style('height', `${figureHeight}px`)
      .style('top', `${figureMarginTop}px`);

    // 3. tell scrollama to update new element dimensions
    this.scroller.resize();
  }
}
