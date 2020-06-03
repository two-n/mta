import { Store } from 'redux';
import { Selection } from 'd3-selection';
import { descending } from 'd3-array';
import { scaleTime, scaleLinear } from 'd3-scale';
import FeverLine from './feverLine';
import { State } from '../../utils/types';
import * as S from '../../redux/selectors';
import { CLASSES as C, FORMATTERS as F, appConfig } from '../../utils/constants';


interface Props{
  store: Store<State>
  parent: Selection
}

const numToShow = 10;
const delay = 150;

export default class FeverGrid {
  [x: string]: any;

  constructor({ store, parent }: Props) {
    this.store = store;
    this.parent = parent;
  }

  init() {
    const overallData = S.getOverallTimeline(this.store).timeline
      .filter(({ date }) => F.pDate(date) > appConfig.startDate);

    const stationData = S.getStationTimelines(this.store)
      .sort((a, b) => descending(a.summary.entries_pct_chg, b.summary.entries_pct_chg))
      .slice(0, numToShow);
    const { date, entries_pct_chg } = S.getDataExtents(this.store);
    // xScale
    this.xScale = scaleTime().domain([appConfig.startDate, date[1]]);
    // yScale
    this.yScale = scaleLinear().domain(entries_pct_chg);
    // benchmark

    this.grid = this.parent.append('div').attr('class', C.FEVERGRID)
      .selectAll(`div.${C.CHART}`)
      .data(stationData)
      .join('div')
      .attr('class', C.CHART)
      .call((sel) => new FeverLine({
        parent: sel,
        xScale: this.xScale,
        yScale: this.yScale,
        benchmark: overallData,
      }).init())
      .classed(C.HIDDEN, true);
  }

  makeGraphsVisible() {
    this.grid
      .style('transition-delay', (_, i:number) => `${i * delay}ms`)
      .classed(C.HIDDEN, false);
  }

  makeGraphsInVisible() {
    this.grid
      .style('transition-delay', (_, i:number, nodes) => `${(nodes.length - i) * delay}ms`)
      .classed(C.HIDDEN, true);
  }

  handleResize() {

  }
}
