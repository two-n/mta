import { select } from 'd3';
import { AppDataType, StepDataType, SectionDataType } from '../../utils/types';
import './style.scss';
import { getSectionHash } from '../../utils/helpers';

interface Props {
  sections: AppDataType
}

export default class Navigation {
  [x: string]:any;

  constructor({ sections }:Props) {
    this.onClick = this.onClick.bind(this);
    this.sections = Object.entries(sections); // [sectionName, object]

    this.el = select('#app').append('div')
      .attr('class', 'Navigation');

    this.nodes = this.el.selectAll('.section')
      .data(this.sections)
      .join('div')
      .attr('class', 'section')
      .selectAll('.node')
      .data(([sectionName, { steps }]: [string, SectionDataType]) => (steps
        ? steps.map((step: StepDataType) => ({ ...step, sectionName }))
        : []))
      .join('div')
      .attr('class', 'node')
      .attr('title', (d) => getSectionHash(d.sectionName, d.step_id))
      .on('click', this.onClick);
  }

  onClick(d) {
    const el = select(`[data-step=${getSectionHash(d.sectionName, d.step_id)}]`).node();
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
}
