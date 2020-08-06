import { Store } from 'redux';
import { select } from 'd3';
import { SectionDataType, State } from '../../utils/types';
import './style.scss';
import { CLASSES as C, SECTIONS, KEYS } from '../../utils/constants';
import { getSectionHash } from '../../utils/helpers';
import Section from '../Section';

interface Props{
  data: SectionDataType;
  store: Store<State>
}
/** Scaffolding for reusable section code */
export default class Methodology extends Section {
  [x: string]: any;

  constructor({ data, store }: Props) {
    super({ data, store, sectionName: SECTIONS.S_METHODOLOGY });
    this.init();
  }

  setUpSection() {
    const { data } = this;
    // the same for each section
    this.el = select('#app').append('section')
      .attr('id', `${this.section}`) /** unique to section */
      .attr('class', C.SECTION);

    this.el.append('div').attr('class', C.TITLE)
      .html(data.title);

    // create steps
    this.steps = this.el
      .selectAll(`.${C.STEP}`).data(data.steps)
      .join('div')
      .attr('class', C.STEP)
      .attr(KEYS.DATA_STEP, (d) => getSectionHash(this.section, d.step_id))
      .html((d) => d.text);

    // data sources
    this.datasources = this.el.append('div', 'data-sources');

    this.datasources.append('div')
      .attr('class', 'title')
      .html('Datasources used');
    this.datasources.selectAll('.data-source')
      .data(data.datasources)
      .join('div')
      .attr('class', 'data-source')
      .html((d) => `${d.source}, ${d.accessed}`);
  }

  // generic window resize listener event
  handleResize() {
    this.scroller.resize();
  }
}
