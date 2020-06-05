import { Store } from 'redux';
import {
  Selection, geoAlbersUsa, geoPath, scaleSequential,
  scaleLinear, scaleBand, interpolateYlOrBr,
  axisBottom, axisRight,
} from 'd3';
import * as S from '../../redux/selectors/index';
import * as A from '../../redux/actions/creators';
import { State, StationData } from '../../utils/types';
import {
  CLASSES as C, VIEWS as V,
  KEYS as K, FORMATTERS as F,
} from '../../utils/constants';
import { getNameHash } from '../../utils/helpers';
import './style.scss';

interface Props{
  store: Store<State>
  parent: Selection
}

const M = {
  top: 20, bottom: 30, left: 40, right: 20,
};
const R = 3;
const duration = 200;

export default class MovingMap {
  [x: string]: any;

  constructor({ store, parent }:Props) {
    this.store = store;
    this.parent = parent;
    this.el = parent.append('svg').attr('class', C.MOVING_MAP);
    this.geoMeshExterior = S.getGeoMeshExterior(this.store);
    this.stationsGISData = S.getStationData(this.store);
    this.turnstileData = S.getStationRollup(this.store);
    this.acsMap = S.getStationToACSMap(this.store);
  }

  init() {
    const E = S.getDataExtents(this.store);

    // SCALES
    this.proj = geoAlbersUsa();

    this.colorScale = scaleSequential((t) => interpolateYlOrBr(1 - t))
      .domain([-1, -0.5]); // TODO: check this

    this.boroYScale = scaleBand().domain(E.boro_code as string[]);

    this.incomeYScale = scaleLinear()
      .domain(E[K.INCOME_PC] as number[]);
    this.incomeYScale.tickFormat(null, F.sDollar);

    this.edHealthYScale = scaleLinear()
      .domain(E[K.ED_HEALTH_PCT] as number[]);
    this.edHealthYScale.tickFormat(null, F.sPct);

    this.uninsuredYScale = scaleLinear()
      .domain(E[K.UNINSURED] as number[]);
    this.uninsuredYScale.tickFormat(null, F.sPct);

    this.xScale = scaleLinear()
      .domain([-1, -0.5]);
    this.xScale.tickFormat(null, F.sPct); // TODO: check this

    this.scaleMap = {
      [V.MAP]: null,
      [V.PCT_CHANGE]: null,
      [V.BOROUGH]: this.boroYScale,
      [V.SCATTER_PCT_INCOME]: this.incomeYScale,
      [V.SCATTER_ED_HEALTH]: this.edHealthYScale,
      [V.SCATTER_UNINSURED]: this.uninsuredYScale,
    };

    // AXES
    this.xAxis = axisBottom(this.xScale);

    // ELEMENTS
    this.map = this.el.append('g').attr('class', C.MAP);
    this.stationsG = this.el.append('g').attr('class', C.STATIONS);
    this.xAxisEl = this.el.append('g').attr('class', `${C.AXIS} x`);
    this.yAxisEl = this.el.append('g').attr('class', `${C.AXIS} y`);

    this.handleResize();
  }

  draw() {
    const [, height] = this.dims;
    const view = S.getView(this.store);
    const yScale = this.scaleMap[view];
    this.geoPath = geoPath().projection(this.proj);
    this.map
      .classed(C.VISIBLE, view === V.MAP)
      .selectAll('path')
      .data([this.geoMeshExterior])
      .join('path')
      .attr('d', this.geoPath);

    this.stations = this.stationsG.selectAll(`g.${C.STATION}`)
      .data(this.stationsGISData)
      .join('g')
      .attr('class', C.STATION);

    this.stations
      .style('transform', (d:StationData) => {
        switch (view) {
          case (V.PCT_CHANGE):
            return `translate(
              ${this.xScale(this.getPctChange(d))}px,${height / 2}px)`;
          case (V.BOROUGH):
            return `translate(
              ${this.xScale(this.getPctChange(d))}px,${yScale(d[K.BOROUGH])}px)`;
          case (V.PCT_CHANGE_BOROUGH):
            return `translate(
              ${this.xScale(this.getPctChange(d))}px,${height / 2}px)`;
          case (V.SCATTER_PCT_INCOME):
            return `translate(
              ${this.xScale(this.getPctChange(d))}px,
              ${yScale(this.getACS(d, K.INCOME_PC))}px)`;
          case (V.SCATTER_ED_HEALTH):
            return `translate(
              ${this.xScale(this.getPctChange(d))}px,
              ${yScale(this.getACS(d, K.ED_HEALTH_PCT))}px)`;
          case (V.SCATTER_UNINSURED):
            return `translate(
              ${this.xScale(this.getPctChange(d))}px,
              ${yScale(this.getACS(d, K.UNINSURED))}px)`;
          default: {
            const [x, y] = this.proj([d.long, d.lat]);
            return `translate(${x}px, ${y}px)`;
          }
        }
      });

    this.stations.selectAll('circle').data((d) => [d])
      .join('circle')
      .attr('r', R)
      .attr('fill', (d) => this.colorScale(this.getPctChange(d)));

    this.xAxisEl
      .classed(C.VISIBLE, view !== V.MAP)
      .transition()
      .duration(duration)
      .attr('transform', `translate(${0}, ${height - M.bottom})`)
      .call(this.xAxis);

    this.yAxisEl
      .classed(C.VISIBLE, !!yScale);

    if (yScale) {
      this.yAxis = axisRight(yScale);
      this.yAxisEl
        .transition()
        .duration(duration)
        .attr('transform', `translate(${M.left}, ${0})`)
        .call(this.yAxis);
    }
  }

  setView(view: VIEWS) {
    this.store.dispatch(A.setView(view));
    this.draw();
  }

  getPctChange(station: StationData) {
    return this.turnstileData.get(getNameHash(station))
     && this.turnstileData.get(getNameHash(station)).summary.entries_pct_chg;
  }

  getACS(station:StationData, field: string) {
    return this.acsMap.get(station.ct2010)
     && this.acsMap.get(station.ct2010)[field] !== K.NA
     && this.acsMap.get(station.ct2010)[field];
  }

  handleResize() {
    const { width, height } = this.parent.node().getBoundingClientRect();
    this.dims = [width, height];
    this.el
      .attr('viewBox', [0, 0, width, height])
      .attr('width', width).attr('height', height);

    // update scales
    this.proj.fitSize([width, height * 1.4], this.geoMeshExterior); // 1.4 to scale up for SI
    this.xScale.range([M.left, width - M.right]);
    this.boroYScale.range([height - M.bottom, M.top]);
    this.incomeYScale.range([height - M.bottom, M.top]);
    this.edHealthYScale.range([height - M.bottom, M.top]);
    this.uninsuredYScale.range([height - M.bottom, M.top]);
    this.draw();
  }
}
