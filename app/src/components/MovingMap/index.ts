import { Store } from 'redux';
import {
  Selection, geoAlbersUsa, geoPath,
  scaleLinear, scaleBand,
  axisBottom, axisLeft, scaleOrdinal, select, scaleSqrt, ScaleLinear,
} from 'd3';
import * as S from '../../redux/selectors/index';
import * as A from '../../redux/actions/creators';
import { State, StationData } from '../../utils/types';
import {
  CLASSES as C, VIEWS as V,
  KEYS as K, FORMATTERS as F, MTA_Colors, SECTIONS,
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


// this.scaleMap = {
//   [V.MAP]: { label: null, scale: null },
//   [V.PCT_CHANGE]: { label: null, scale: null },
//   [V.BOROUGH]: { label: null, scale: this.boroYScale, format: F.fBorough },
//   [V.PCT_CHANGE_BOROUGH]: { label: null, scale: null },
//   [K.WHITE]: { scale: this.incomeYScale, format: F.sDollar },
//   [K.INCOME_PC]: { scale: this.incomeYScale, format: F.sDollar },
//   [K.ED_HEALTH_PCT]: { scale: this.edHealthYScale, format: F.fPctNoMult },
//   [K.UNINSURED]: { scale: this.uninsuredYScale, format: F.fPctNoMult },
//   [K.SNAP_PCT]: { scale: this.uninsuredYScale, format: F.fPctNoMult },
// };

const FORMAT_MAP:{[key:string]: (d:number)=> string} = {
  [K.WHITE]: F.fPctNoMult,
  [K.INCOME_PC]: F.sDollar,
  [K.ED_HEALTH_PCT]: F.fPctNoMult,
  [K.UNINSURED]: F.fPctNoMult,
  [K.SNAP_PCT]: F.fPctNoMult,
};

export default class MovingMap {
  yScales: {
    [key:string]: {
      scale: ScaleLinear<number, number>,
      format: (d:number)=> string,
      label: string,
      median: string
    }
  }

  [x: string]: any;

  constructor({ store, parent }:Props) {
    this.store = store;
    this.parent = parent.classed(C.MOVING_MAP, true);
    this.el = parent.append('svg');
    this.geoMeshExterior = S.getGeoMeshExterior(this.store);
    this.stationsGISData = S.getStationData(this.store);
    this.turnstileData = S.getStationRollup(this.store);
    this.acsMap = S.getStationToACSMap(this.store);
  }

  init() {
    const E = S.getDataExtents(this.store);

    const scatterKeys = S.getSectionData(this.store)[SECTIONS.S_MOVING_MAP]
      .steps
      .filter((d) => d[K.DOT_POSITION] && d[K.DOT_POSITION][K.Y_KEY])
      .map((d) => d[K.DOT_POSITION]);

    console.log('scatterKeys', scatterKeys);

    // SCALES
    this.proj = geoAlbersUsa();

    this.colorScale = S.getColorScheme(this.store);

    this.colorBoroughScale = scaleOrdinal().domain(E[K.BOROUGH] as string[]).range(MTA_Colors);

    this.boroYScale = scaleBand().domain(E[K.BOROUGH] as string[]);

    this.yScales = scatterKeys.reduce((obj, d) => ({
      ...obj,
      [d[K.Y_KEY]]: {
        scale: scaleLinear().domain(E[d[K.Y_KEY]] as number[]),
        label: d[K.Y_DISPLAY],
        median: d[K.Y_MEDIAN_LABEL] || d[K.Y_DISPLAY],
        format: FORMAT_MAP[d[K.Y_KEY]],
      },
    }), {});

    this.xScale = scaleLinear()
      .domain(E[K.SUMMARY_SWIPES_PCT_CHG] as [number, number]);
    this.xScale.tickFormat(null, F.sPct);

    this.rScale = scaleSqrt()
      .domain(E[K.SUMMARY_SWIPES_AVG_POST] as [number, number])
      .range([2, 10]);


    // AXES
    this.xAxis = axisBottom(this.xScale).tickFormat(F.fPct);

    // ELEMENTS
    this.map = this.el.append('g').attr('class', C.MAP);
    this.stationsG = this.el.append('g').attr('class', C.STATIONS);
    this.xAxisEl = this.el.append('g').attr('class', `${C.AXIS} x`);
    this.yAxisEl = this.el.append('g').attr('class', `${C.AXIS} y`);
    this.overlay = this.parent.append('div').attr('class', C.OVERLAY);

    this.handleResize();
  }

  draw() {
    const [width, height] = this.dims;
    const view = S.getView(this.store);
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
          case (V.SWARM): // TODO: calculate swarm positions
            return `translate(
          ${this.xScale(this.getPctChange(d))}px,${height / 2}px)`;
          case (V.SCATTER):
          {
            const yScale = this.yScales[this.yKey].scale;
            return `translate(
              ${this.xScale(this.getPctChange(d))}px,${yScale(this.getACS(d, this.yKey))}px)`;
          }
          default: {
            const [x, y] = this.proj([d.long, d.lat]);
            return `translate(${x}px, ${y}px)`;
          }
        }
      });

    this.stations.selectAll('circle').data((d) => [d])
      .join('circle')
      .attr('r', (d) => this.rScale(this.turnstileData.get(d.unit).summary.swipes_avg_post))
      .attr('fill', (d) => (this.colorScale(this.getPctChange(d))));

    this.stations.selectAll('text').data((d) => [d])
      .join('text')
      .attr('y', -R - 3)
      .text((d) => getNameHash(d));

    // AXES
    this.xAxisEl
      .transition()
      .duration(duration)
      .attr('transform', `translate(${0}, ${height - M.bottom})`)
      .call(this.xAxis);

    this.overlay.selectAll(`div.${C.AXIS}-${C.LABEL}.x`)
      .data(['← Higher decrease in ridership', 'Lower decrease in ridership→'])
      .join('div')
      .attr('class', `${C.AXIS}-${C.LABEL} ${C.NO_WRAP} x`)
      .style('left', (d, i) => i === 0 && `${M.left}px`)
      .style('right', (d, i) => i === 1 && `${M.right}px`)
      .style('transform', `translateY(${height - M.bottom}px)`)
      .html((d) => d);

    if (this.yScales[this.yKey]) {
      const { scale: yScale, format, label } = this.yScales[this.yKey];
      this.yAxis = axisLeft(yScale).tickFormat(format);
      this.yAxisEl
        .transition()
        .duration(duration)
        .attr('transform', `translate(${M.left}, ${0})`)
        .call(this.yAxis);

      this.overlay.selectAll(`div.${C.AXIS}-${C.LABEL}.y`)
        .data([label])
        .join('div')
        .attr('class', `${C.AXIS}-${C.LABEL} y`)
        .style('top', `${height / 2}px`)
        .style('transform', 'translateY(-50%)')
        .style('width', `${M.left - 20}px`)
        .html((d) => d);
    }

    // VISIBILITY
    this.parent.selectAll('.x');
    // .classed(C.VISIBLE, view !== V.MAP); // TODO: fix
    this.parent.selectAll('.y')
      .classed(C.VISIBLE, !!this.yKey);
  }

  setView(view: V, key?:string) {
    this.store.dispatch(A.setView(view));
    this.yKey = key;
    this.draw();
  }

  getPctChange(station: StationData) {
    return this.turnstileData.get(station.unit)
     && this.turnstileData.get(station.unit).summary.swipes_pct_chg;
  }

  getACS(station:StationData, field: string) {
    return this.acsMap.get(station.NTACode)
     && this.acsMap.get(station.NTACode)[field] !== K.NA
     && this.acsMap.get(station.NTACode)[field];
  }

  handleResize() {
    const { width, height } = this.parent.node().getBoundingClientRect();
    this.dims = [width, height];
    this.el
      .attr('viewBox', [0, 0, width, height])
      .attr('width', width).attr('height', height);

    this.overlay.style('width', `${width}px`).style('height', `${height}px`);

    // update scales
    this.proj.fitSize([width, height * 1.4], this.geoMeshExterior); // 1.4 to scale up for SI
    this.xScale.range([M.left, width - M.right]);

    // update yScale ranges
    Object.values(this.yScales).forEach((d) => d.scale.range([height - M.bottom - R, M.top]));
    this.draw();
  }
}
