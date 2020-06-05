import { Store } from 'redux';
import { Selection } from 'd3-selection';
import { geoAlbersUsa, geoPath } from 'd3-geo';
import { scaleSequential, scaleLinear, scaleBand } from 'd3-scale';
import { interpolateYlOrBr } from 'd3-scale-chromatic';
import * as S from '../../redux/selectors';
import * as A from '~redux/actions/creators';
import { State, StationData } from '../../utils/types';
import {
  CLASSES as C, VIEWS as V, VIEWS, KEYS as K,
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

export default class MovingMap {
  [x: string]: any;

  constructor({ store, parent }:Props) {
    this.store = store;
    this.parent = parent;
    this.el = parent.append('svg').attr('class', C.MOVING_MAP);
    this.geoMeshExterior = S.getGeoMeshExterior(this.store);
    this.stationsGISData = S.getStationData(this.store);
    this.turnstileData = S.getStationRollup(this.store);
  }

  init() {
    const { entries_pct_chg, boro_code } = S.getDataExtents(this.store);
    this.proj = geoAlbersUsa();
    this.map = this.el.append('g').attr('class', C.MAP);
    this.stationsG = this.el.append('g').attr('class', C.STATIONS);
    this.colorScale = scaleSequential((t) => interpolateYlOrBr(1 - t))
      .domain([-1, -0.5]); // TODO: check this
    this.boroYScale = scaleBand().domain(boro_code as string[]);

    this.xScale = scaleLinear().domain([-1, -0.5]); // TODO: check this
    this.handleResize();
  }

  draw() {
    const [, height] = this.dims;
    const view = S.getView(this.store);
    this.geoPath = geoPath().projection(this.proj);
    this.map.selectAll('path')
      .data([this.geoMeshExterior])
      .join('path')
      .attr('d', this.geoPath)
      .classed(C.VISIBLE, view === V.MAP);

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
              ${this.xScale(this.getPctChange(d))}px,${this.boroYScale(d[K.BOROUGH])}px)`;
          case (V.PCT_CHANGE_BOROUGH):
            return `translate(
              ${this.xScale(this.getPctChange(d))}px,${height / 2}px)`;
          case (V.SCATTER1):
            return `translate(
              ${this.xScale(this.getPctChange(d))}px,${height / 2}px)`; // TODO
          case (V.SCATTER2):
            return `translate(
              ${this.xScale(this.getPctChange(d))}px,${height / 2}px)`; // TODO
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
  }

  setView(view: VIEWS) {
    this.store.dispatch(A.setView(view));
    this.draw();
  }

  getPctChange(station) {
    return this.turnstileData.get(getNameHash(station))
     && this.turnstileData.get(getNameHash(station)).summary.entries_pct_chg;
  }

  handleResize() {
    const { width, height } = this.parent.node().getBoundingClientRect();
    this.dims = [width, height];
    this.el
      .attr('viewBox', [0, 0, width, height])
      .attr('width', width).attr('height', height);

    // update scales
    this.proj.fitSize([width, height * 1.4], this.geoMeshExterior);
    this.xScale.range([M.left, width - M.right]);
    this.boroYScale.range([height - M.bottom, M.top]);
    this.draw();
  }
}
