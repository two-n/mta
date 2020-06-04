import { Store } from 'redux';
import { Selection } from 'd3-selection';
import { geoAlbersUsa, geoPath } from 'd3-geo';
import { scaleSequential } from 'd3-scale';
import { interpolateYlOrBr } from 'd3-scale-chromatic';
import * as S from '~redux/selectors';
import { State, StationData } from '~utils/types';
import { CLASSES as C } from '~utils/constants';
import { getNameHash } from '~utils/helpers';
import './style.scss';

interface Props{
  store: Store<State>
  parent: Selection
}

const M = {
  top: 20, bottom: 30, left: 40, right: 20,
};
const R = 3;
const durationLong = 5000;
const durationShort = 200;

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
    const { entries_pct_chg } = S.getDataExtents(this.store);
    this.proj = geoAlbersUsa();
    this.map = this.el.append('g').attr('class', C.MAP);
    this.stationsG = this.el.append('g').attr('class', C.STATIONS);
    this.colorScale = scaleSequential((t) => interpolateYlOrBr(1 - t))
      .domain([-1, -0.5]); // TODO: check this
    this.handleResize();
  }

  draw() {
    this.geoPath = geoPath().projection(this.proj);
    this.map.selectAll('path')
      .data([this.geoMeshExterior])
      .join('path')
      .attr('d', this.geoPath);

    this.stations = this.stationsG.selectAll(`g.${C.STATION}`)
      .data(this.stationsGISData)
      .join('g')
      .attr('class', C.STATION)
      .style('transform', (d:StationData) => {
        const [x, y] = this.proj([d.long, d.lat]);
        return `translate(${x}px, ${y}px)`;
      });

    this.stations.selectAll('circle').data((d) => [d])
      .join('circle')
      .attr('r', R)
      .attr('fill', (d) => this.turnstileData.get(getNameHash(d)) && this.colorScale(
        this.turnstileData.get(getNameHash(d)).summary.entries_pct_chg,
      ));
  }

  handleResize() {
    const { width, height } = this.parent.node().getBoundingClientRect();
    this.dims = [width, height];
    this.el
      .attr('viewBox', [0, 0, width, height])
      .attr('width', width).attr('height', height);

    // update scales
    this.proj.fitSize([width, height], this.geoMeshExterior);
    this.draw();
  }
}
