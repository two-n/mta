import { Store } from 'redux';
import { Selection } from 'd3-selection';
import { geoAlbersUsa, geoPath } from 'd3-geo';
import * as S from '~redux/selectors';
import { State } from '~utils/types';
import { CLASSES as C } from '~utils/constants';
import './style.scss';

interface Props{
  store: Store<State>
  parent: Selection
}

const M = {
  top: 20, bottom: 30, left: 40, right: 20,
};
const durationLong = 5000;
const durationShort = 200;
export default class MovingMap {
  [x: string]: any;

  constructor({ store, parent }:Props) {
    this.store = store;
    this.parent = parent;
    this.el = parent.append('svg').attr('class', C.MOVING_MAP);
    this.data = S.getGeoMeshExterior(this.store);
  }

  init() {
    this.proj = geoAlbersUsa();

    this.map = this.el.append('g').attr('class', C.MAP);
    this.handleResize();
  }

  draw() {
    this.geoPath = geoPath().projection(this.proj);
    this.map.selectAll('path')
      .data([this.data])
      .join('path')
      .attr('d', this.geoPath);
  }

  handleResize() {
    const { width, height } = this.parent.node().getBoundingClientRect();
    this.dims = [width, height];
    this.el
      .attr('viewBox', [0, 0, width, height])
      .attr('width', width).attr('height', height);

    // update scales
    this.proj.fitSize([width, height], this.data);
    this.draw();
  }
}
