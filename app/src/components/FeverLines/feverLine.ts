import {
  Selection,
  ScaleTime, ScaleLinear, line,
} from 'd3';
import { CLASSES as C, FORMATTERS as F } from '../../utils/constants';
import { ProcessedStation, StationTimelineItem } from '../../utils/types';
import './style.scss';

interface Props{
  parent: Selection;
  xScale: ScaleTime<number, number>;
  yScale: ScaleLinear<number, number>;
  benchmark: StationTimelineItem[];
}

const width = 150;
const height = width / 1.168;
const M = {
  top: 20, bottom: 30, left: 40, right: 20,
};

export default class FeverLine {
  [x: string]: any;

  constructor({
    parent, xScale, yScale, benchmark,
  }: Props) {
    this.parent = parent;
    this.benchmark = benchmark;
    this.el = this.parent.append('svg')
      .attr('class', C.FEVERLINE)
      .attr('width', width)
      .attr('height', height);


    this.xScale = xScale.range([M.left, width - M.right]);
    this.yScale = yScale.range([height - M.bottom, M.top]);
    this.line = line()
    // @ts-ignore
      .x(({ date }) => this.xScale(F.pDate(date)))
    // @ts-ignore
      .y(({ entries_pct_chg }) => this.yScale(entries_pct_chg));
  }

  init() {
    this.el.selectAll(`.${C.TITLE}`)
      .data(({ station }: ProcessedStation) => [station])
      .join('text')
      .attr('class', C.TITLE)
      .text((d) => d)
      .attr('transform', `translate(${M.left}, ${M.top})`);

    this.el.append('g').attr('class', C.LINES)
      .selectAll(`path.${C.LINE}`)
      .data(({ timeline }: ProcessedStation) => ([this.benchmark, timeline]))
      .join('path')
      .attr('class', (d, i:number) => `${C.LINE} ${i === 0 && C.BENCHMARK}`)
      .attr('d', this.line);
  }
}
