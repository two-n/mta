import { Store } from 'redux';
import {
  Selection, scaleLinear, scaleTime, max, extent, line, axisLeft, axisBottom, easeLinear, select, scaleUtc, window,
} from 'd3';
import { bisector } from 'd3-array';
import { State, TimelineAnnotation, StationTimelineItem } from '../../utils/types';
import { CLASSES as C, FORMATTERS as F, DIRECTIONS } from '../../utils/constants';
import './style.scss';
import * as S from '../../redux/selectors';


const annotations: TimelineAnnotation[] = [
  {
    date: F.pDate('14-02-2020'),
    step_id: 0,
    label: '"Normal" Friday (also Valentines Day)',
    duration: 3000,
  },
  {
    date: F.pDate('01-03-2020'),
    step_id: 1,
    label: 'First COVID-19 Case in NY State',
    duration: 1000,
  },
  {
    date: F.pDate('22-03-2020'),
    step_id: 2,
    label: 'NYS on Pause goes into effect',
    duration: 1000,
  },
  {
    date: F.pDate('07-04-2020'),
    step_id: 3,
    label: '1,055 deaths in one day',
    duration: 1000,
  },
  {
    date: F.pDate('08-06-2020'),
    step_id: 4,
    label: 'retail begins to re-open', // think about how to handle this
    duration: 1000,
  },
];

interface Props {
  parent: Selection;
  store: Store<State>
}

const M = {
  top: 20, bottom: 30, left: 50, right: 20,
};
const durationShort = 200;

export default class Timeline {
  [x: string]: any;

  store: Store<State>

  dims: [number, number]; // width, height

  constructor({ parent, store }: Props) {
    this.store = store;
    this.parent = parent;
    this.el = parent.append('svg')
      .attr('class', C.TIMELINE);
    this.currentIndex = -1;
  }

  init() {
    const { timeline } = S.getOverallTimeline(this.store);

    // scales - range set in resize handler
    this.y = scaleLinear()
      .domain([0, max(timeline, ({ entries }) => entries)]);

    this.x = scaleUtc()
      .domain(extent(timeline, ({ date }) => F.pDate(date)));

    // axes
    this.yAxis = axisLeft(this.y).tickFormat(F.fNumber);
    this.xAxis = axisBottom(this.x).tickFormat(F.fMonth);

    this.line = line()
      // @ts-ignore
      .x(({ date }) => this.x(F.pDate(date)))
      // @ts-ignore
      .y(({ entries }) => this.y(entries));

    this.el.append('g').attr('class', C.LINES);
    this.el.append('g').attr('class', `${C.AXIS} x`);
    this.el.append('g').attr('class', `${C.AXIS} y`);
    this.el.append('g').attr('class', C.ANNOTATIONS);
    this.handleResize();
  }

  draw() {
    const { bisectedTimeline, currentIndex } = this; // line segment for each transition
    const [width, height] = this.dims;

    this.lines = this.el.select(`.${C.LINES}`)
      .selectAll(`path.${C.LINE}`)
      .data(bisectedTimeline)
      .join('path')
      .attr('class', C.LINE)
      .attr('d', ({ timeline }) => this.line(timeline))
      .attr(C.DATA_STEP, ({ step_id }) => step_id)
      .transition()
      .duration((d) => (d.step_id === currentIndex ? d.duration : 0))
      .ease(easeLinear)
      .attr('stroke-dasharray', function (d) {
        const lineLength = select(this).node().getTotalLength();
        return `${currentIndex >= d.step_id ? lineLength : 0},${lineLength}`;
      })
      .on('interrupt end', (d) => this.toggleAnnotationVisibility(d.step_id));

    this.el.select(`.x.${C.AXIS}`)
      .transition()
      .duration(durationShort)
      .attr('transform', `translate(${0}, ${height - M.bottom})`)
      .call(this.xAxis);

    this.el.select(`.y.${C.AXIS}`)
      .transition()
      .duration(durationShort)
      .attr('transform', `translate(${M.left}, ${0})`)
      .call(this.yAxis);
    this.el.select(`.y.${C.AXIS}`).selectAll(`text.${C.LABEL}`)
      .data(['Daily Metrocard Entry Swipes'])
      .join('text')
      .attr('class', C.LABEL)
      .attr('writing-mode', 'vertical-rl')
      .attr('dx', '-3.5em')
      .attr('transform', `translate(${0}, ${height / 2})`)
      .text((d) => d);

    this.annotations = this.el.select(`g.${C.ANNOTATIONS}`).selectAll(`g.${C.ANNOTATION}`)
      .data(annotations)
      .join('g')
      .attr('class', C.ANNOTATION)
      .attr(C.DATA_STEP, ({ step_id }) => step_id)
      .attr('transform', ({ date }: TimelineAnnotation) => `translate(${this.x(date)}, ${M.top})`);


    this.annotations.selectAll('path').data((d) => [d])
      .join('path')
      .attr('d', `M ${0} ${0} V ${height - M.bottom - M.top}`);

    this.annotations.selectAll('text')
      .data((d) => [d])
      .join('text')
      .attr('dy', '-1em')
      .text(({ label }) => label);
  }

  handleTransition(index:number, direction: DIRECTIONS) {
    this.currentIndex = index;
    if (index === 0 && direction === DIRECTIONS.UP) this.currentIndex = index - 1;
    this.draw();
  }

  toggleAnnotationVisibility(index) {
    const { currentIndex } = this;
    if (index === currentIndex) {
      this.annotations.classed(C.VISIBLE, ({ step_id }) => step_id === currentIndex);
    }
  }

  get bisectedTimeline() {
    const { timeline } = S.getOverallTimeline(this.store);
    let startIndex = 0;
    const bisect = bisector((d: StationTimelineItem) => F.pDate(d.date));

    return annotations.map((d) => {
      const nextIndex = bisect.left(timeline, d.date);
      const obj = {
        ...d, timeline: timeline.slice(startIndex, nextIndex + 1),
      };
      startIndex = nextIndex;
      return obj;
    });
  }

  handleResize() {
    const { width, height } = this.parent.node().getBoundingClientRect();
    this.dims = [width, height];
    this.el.attr('width', width).attr('height', height);

    // update scales
    this.y.range([height - M.bottom, M.top]);
    this.x.range([M.left, width - M.right]);
    this.draw();
  }
}
