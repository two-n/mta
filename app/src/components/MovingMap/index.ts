import { Store } from 'redux';
import {
  Selection, geoAlbersUsa, geoPath, scaleSequential,
  scaleLinear, scaleBand, interpolateYlOrBr,
  axisBottom, axisRight, axisLeft, scaleOrdinal, select,
} from 'd3';
import * as S from '../../redux/selectors/index';
import * as A from '../../redux/actions/creators';
import { State, StationData } from '../../utils/types';
import {
  CLASSES as C, VIEWS as V,
  KEYS as K, FORMATTERS as F, MTA_Colors,
} from '../../utils/constants';
import { getNameHash } from '../../utils/helpers';
import './style.scss';

interface Props{
  store: Store<State>
  parent: Selection
}

const M = {
  top: 20, bottom: 50, left: 90, right: 20,
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
      .domain(E.summary_pct_chg as [number, number]);

    this.colorBoroughScale = scaleOrdinal().domain(E.boro_code as string[]).range(MTA_Colors);

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
      .domain(E.summary_pct_chg as [number, number]);
    this.xScale.tickFormat(null, F.sPct);

    this.scaleMap = {
      [V.MAP]: { label: null, scale: null },
      [V.PCT_CHANGE]: { label: null, scale: null },
      [V.BOROUGH]: { label: 'Borough', scale: this.boroYScale, format: F.fBorough },
      [V.PCT_CHANGE_BOROUGH]: { label: null, scale: null },
      [V.SCATTER_PCT_INCOME]: { label: 'Per Capita Income ($)', scale: this.incomeYScale, format: F.sDollar },
      [V.SCATTER_ED_HEALTH]: { label: 'Percent Employed in Educational Services, and Health Care and Social Assistance (%)', scale: this.edHealthYScale, format: F.fPctNoMult },
      [V.SCATTER_UNINSURED]: { label: 'Percent with No Health Insurance Coverage (%)', scale: this.uninsuredYScale, format: F.fPctNoMult },
    };

    // AXES
    this.xAxis = axisBottom(this.xScale).tickFormat(F.fPct);

    // ELEMENTS
    this.map = this.el.append('g').attr('class', C.MAP);
    this.stationsG = this.el.append('g').attr('class', C.STATIONS);
    this.xAxisEl = this.el.append('g').attr('class', `${C.AXIS} x`);
    this.yAxisEl = this.el.append('g').attr('class', `${C.AXIS} y`);

    this.handleResize();
  }

  draw() {
    const [width, height] = this.dims;
    const view = S.getView(this.store);
    const { scale: yScale, label, format } = this.scaleMap[view];
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
      .attr('class', C.STATION)
      .on('mouseover', function () { select(this).raise(); });

    this.stations
      .style('transform', (d:StationData) => {
        switch (view) {
          case (V.PCT_CHANGE):
            return `translate(
              ${this.xScale(this.getPctChange(d))}px,${height / 2}px)`;
          case (V.BOROUGH):
            return `translate(
              ${this.xScale(this.getPctChange(d))}px,${yScale(d[K.BOROUGH]) + yScale.bandwidth() / 2}px)`;
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

    // views that should be colored by borough
    const boroughFills = [V.PCT_CHANGE_BOROUGH, V.SCATTER_ED_HEALTH, V.SCATTER_PCT_INCOME, V.SCATTER_UNINSURED];
    this.stations.selectAll('circle').data((d) => [d])
      .join('circle')
      .attr('r', R)
      .attr('fill', (d) => (boroughFills.includes(view)
        ? this.colorBoroughScale(d[K.BOROUGH])
        : this.colorScale(this.getPctChange(d))));

    this.stations.selectAll('text').data((d) => [d])
      .join('text')
      .attr('y', -R - 3)
      .text((d) => getNameHash(d));

    this.xAxisEl
      .classed(C.VISIBLE, view !== V.MAP)
      .transition()
      .duration(duration)
      .attr('transform', `translate(${0}, ${height - M.bottom})`)
      .call(this.xAxis);

    this.xAxisEl.selectAll(`text.${C.LABEL}`)
      .data(['Percent Decline in Ridership'])
      .join('text')
      .attr('class', C.LABEL)
      .attr('transform', `translate(${width / 2}, ${0})`)
      .attr('dy', '3.5em')
      .text((d) => d);

    this.yAxisEl
      .classed(C.VISIBLE, !!yScale);

    if (yScale) {
      this.yAxis = axisLeft(yScale).tickFormat(format);
      this.yAxisEl
        .transition()
        .duration(duration)
        .attr('transform', `translate(${M.left}, ${0})`)
        .call(this.yAxis);

      this.yAxisEl.selectAll(`text.${C.LABEL}`)
        .data([label])
        .join('text')
        .attr('class', C.LABEL)
        .attr('transform', `translate(${0}, ${height / 2})`)
        .attr('writing-mode', 'vertical-lr')
        .attr('dx', '-4.5em')
        .text((d) => d);
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
