import { Store } from 'redux';
import { Selection } from 'd3-selection';
import { scaleLinear, scaleTime } from 'd3-scale';
import 'd3-transition';
import { max, extent } from 'd3-array';
import { line } from 'd3-shape';
import { axisLeft, axisBottom } from 'd3-axis';
import { easeLinear } from 'd3-ease';
import { State } from '../../utils/types';
import { CLASSES as C, FORMATTERS as F } from '../../utils/constants';
import './style.scss';
import * as S from '../../redux/selectors';


interface Props {
  parent: Selection;
  store: Store<State>
}

const M = {
  top: 20, bottom: 30, left: 40, right: 20,
};
const durationLong = 5000;
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
    this.isVisible = false;
  }

  init() {
    const { timeline } = S.getOverallTimeline(this.store);

    // scales - range set in resize handler
    this.y = scaleLinear()
      .domain([0, max(timeline, ({ entries }) => entries)]);

    this.x = scaleTime()
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
    this.handleResize();
  }

  draw() {
    const { timeline } = S.getOverallTimeline(this.store);
    const [, height] = this.dims;

    this.el.select(`.${C.LINES}`)
      .selectAll(`path.${C.LINE}`)
      .data([timeline])
      .join('path')
      .attr('class', C.LINE)
      .attr('d', this.line)
      .attr('stroke-dasharray', () => {
        this.lineLength = this.el.select(`path.${C.LINE}`).node().getTotalLength();
        return `${this.isVisible ? this.lineLength : 0},${this.lineLength}`;
      });

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
  }

  animateInLine() {
    this.el.select(`path.${C.LINE}`)
      .transition()
      .duration(durationLong)
      .ease(easeLinear)
      .attr('stroke-dasharray', `${this.lineLength},${this.lineLength}`)
      .on('interrupt end', () => { this.isVisible = true; });
  }

  animateOutLine() {
    this.el.select(`path.${C.LINE}`)
      .transition()
      .duration(durationLong)
      .ease(easeLinear)
      .attr('stroke-dasharray', `${0},${this.lineLength}`)
      .on('interrup end', () => { this.isVisible = false; });
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
