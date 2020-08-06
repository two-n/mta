
import { Selection, scaleLinear } from 'd3';
import { max } from 'd3-array';
import { StationTimelineItem } from '../../utils/types';
import { CLASSES as C, FORMATTERS as F } from '../../utils/constants';

import './style.scss';

interface Props {
  initialWeek: string;
  updateWeek: (week:string)=> void;
  timeline: StationTimelineItem[];
  parent: Selection;
  customClass?: string;
}

export default class TimelineFilter {
  [x: string]:any;

  constructor({
    parent, customClass, timeline, initialWeek,
    updateWeek,
  }:Props) {
    this.el = parent.append('div')
      .attr('class', `filterTimeline ${customClass || ''}`);
    this.week = initialWeek;
    this.timeline = timeline;
    this.updateWeek = updateWeek;

    this.handleClick = this.handleClick.bind(this);
    this.init();
  }

  init() {
    // scales - range set in resize handler
    this.y = scaleLinear()
      .domain([0, max(this.timeline, ({ swipes }) => swipes as number)])
      .range([0, 100]);// percent


    // elements
    this.bars = this.el.append('div').attr('class', `${C.TIMELINE}-${C.WRAPPER}`)
      .selectAll(`div.${C.BAR}-${C.WRAPPER}`)
      .data(this.timeline)
      .join('div')
      .attr('class', `${C.BAR}-${C.WRAPPER}`)
      .on('click', (d) => this.handleClick(d.date));

    this.bars.append('div').attr('class', `${C.LABEL}`)
      .html((d) => `${F.fDayMonth(F.pWeek(d.date))}`);

    this.bars.append('div').attr('class', `${C.BAR}`)
      .style('height', (d) => `${this.y(d.swipes)}%`);

    this.updateVisibility();
  }

  updateVisibility(newWeek = this.week) {
    this.week = newWeek;
    this.bars.classed(C.ACTIVE, (d) => F.pWeek(d.date) <= F.pWeek(this.week))
      .classed('last', (d) => d.date === this.week);
  }

  handleClick(newWeek:string) {
    this.updateWeek(newWeek); // dispatches action
    this.updateVisibility(newWeek);
  }
}
