import { Store } from 'redux';
import {
  Selection, scaleLinear, min, max, line, axisLeft, axisBottom, easeLinear, select, scaleUtc,
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
    label: '"Normal" Week (also includes Valentines Day)',
    duration: 700,
  },
  {
    date: F.pDate('01-03-2020'),
    step_id: 1,
    label: 'First COVID-19 Case in NY State',
    duration: 700,
  },
  {
    date: F.pDate('22-03-2020'),
    step_id: 2,
    label: 'NYS on Pause goes into effect',
    duration: 700,
  },
  {
    date: F.pDate('07-04-2020'),
    step_id: 3,
    label: 'Peak number of deaths',
    duration: 700,
  },
  {
    date: F.pDate('08-06-2020'),
    step_id: 4,
    label: 'Re-Opening Begins', // think about how to handle this
    duration: 700,
  },
];

interface Props {
  parent: Selection;
  store: Store<State>
}

const M = {
  top: 20, bottom: 30, left: 100, right: 50,
};
const durationShort = 200;
const radius = 15;

export default class Timeline {
  [x: string]: any;

  store: Store<State>

  dims: [number, number]; // width, height

  constructor({ parent, store }: Props) {
    this.store = store;
    this.parent = parent.classed(C.TIMELINE, true);
    this.el = this.parent.append('svg');
    this.overlay = this.parent.append('div').attr('class', C.OVERLAY);
    this.currentIndex = -1;
  }

  init() {
    const { timeline } = S.getOverallTimeline(this.store);
    // scales - range set in resize handler
    this.y = scaleLinear()
      .domain([0, max(timeline, ({ swipes }) => swipes)]);

    this.x = scaleUtc()
      .domain([min(timeline, ({ date }) => F.pDate(date)), F.pDate('08-06-2020')]); // TODO: make clearer

    // axes
    this.yAxis = axisLeft(this.y).tickFormat(F.fNumber);
    this.xAxis = axisBottom(this.x).tickFormat(F.fMonth);

    this.line = line()
      // @ts-ignore
      .x(({ date }) => this.x(F.pDate(date)))
      // @ts-ignore
      .y(({ swipes }) => this.y(swipes));

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

    this.overlay.selectAll(`div.${C.AXIS}-${C.LABEL}.y`)
      .data(['Daily Metrocard Swipes'])
      .join('div')
      .attr('class', `${C.AXIS}-${C.LABEL} y`)
      .style('top', `${height / 2}px`)
      .style('transform', 'translateY(-50%)')
      .style('width', `${M.left - 20}px`)
      .html((d) => d);

    this.annotations = this.el.select(`g.${C.ANNOTATIONS}`).selectAll(`g.${C.ANNOTATION}`)
      .data(bisectedTimeline)
      .join('g')
      .attr('class', C.ANNOTATION)
      .attr(C.DATA_STEP, ({ step_id }) => step_id)
      .attr('transform', ({ timeline }: TimelineAnnotation) => `translate(${this.x(F.pDate(timeline[timeline.length - 1].date))}, ${0})`)
      .classed(C.FADED, ({ step_id }) => step_id < currentIndex);

    this.annotations.selectAll('circle').data((d) => [d])
      .join('circle')
      .attr('cy', ({ timeline }) => this.y(timeline[timeline.length - 1].swipes))
      .attr('r', radius);

    this.overlay.selectAll(`div.${C.ANNOTATION}-${C.LABEL}`)
      .data(bisectedTimeline)
      .join('div')
      .attr('class', `${C.ANNOTATION}-${C.LABEL}`)
      .attr(C.DATA_STEP, ({ step_id }) => step_id)
      .style('top', ({ timeline }) => `${this.y(timeline[timeline.length - 1].swipes)}px`)
      .style('left', ({ date }) => `${this.x(date) - radius}px`)
      .html(({ label }) => label);
  }

  handleTransition(index:number, direction: DIRECTIONS) {
    this.currentIndex = index;
    if (index === 0 && direction === DIRECTIONS.UP) this.currentIndex = index - 1;
    this.draw();
  }

  toggleAnnotationVisibility(index) {
    const { currentIndex } = this;
    if (index === currentIndex) {
      this.annotations
        .classed(C.VISIBLE, ({ step_id }) => step_id === currentIndex)
        .classed(C.FADED, ({ step_id }) => step_id < currentIndex);

      this.overlay.selectAll(`div.${C.ANNOTATION}-${C.LABEL}`)
        .classed(C.VISIBLE, ({ step_id }) => step_id === currentIndex)
        .classed(C.FADED, ({ step_id }) => step_id < currentIndex);
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
    this.overlay.style('width', `${width}px`).style('height', `${height}px`);
    // update scales
    this.y.range([height - M.bottom, M.top]);
    this.x.range([M.left, width - M.right]);
    this.draw();
  }
}
