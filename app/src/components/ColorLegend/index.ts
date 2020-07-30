import {
  ticks, scaleLinear, Selection, ScaleLinear,
} from 'd3';
import { CLASSES as C } from '../../utils/constants';
import './style.scss';

const WIDTH = 150; const HEIGHT = 30; const
  M = { top: 10, bottom: 7 };
const GRADIENT = 'gradient';
const numTicks = 4;

interface Props{
  parent: Selection;
  title: string;
  scale: ScaleLinear<number, number>
  format?: (d:number)=> string
}

export default class ColorLegend {
  [x: string]: any;

  constructor({
    parent, title, scale, format,
  }: Props) {
    this.parent = parent;
    this.scale = scale;
    this.format = format;

    this.el = this.parent
      .append('div')
      .attr('class', 'color-legend');

    this.el.append('div').attr('class', C.TITLE)
      .html(title);

    this.svg = this.el.append('svg').attr('width', WIDTH).attr('height', HEIGHT);
    this.svg.append('defs').append('linearGradient')
      .attr('id', GRADIENT)
      .selectAll('stop')
      .data(this.stops)
      .join('stop')
      .attr('offset', (d, i) => `${(i / (this.stops.length - 1)) * 100}%`)
      .attr('stop-color', (d) => this.scale(d));

    this.svg.append('rect')
      .attr('width', '100%')
      .attr('height', HEIGHT - M.bottom - M.top)
      .attr('fill', `url(#${GRADIENT})`);

    this.update();
  }

  update(newScale = this.scale) {
    this.scale = newScale;
    const x = scaleLinear().domain(this.extent).range([0, WIDTH]);
    this.ticks = this.svg.selectAll('g.tick').data(this.stops)
      .join((enter) => enter.append('g')
        .call((sel) => sel.append('path').attr('d', `M 0 ${0} V ${HEIGHT - M.top}`))
        .call((sel) => sel.append('text').attr('y', HEIGHT - M.bottom)
          .attr('dy', '.75em')))
      .attr('class', 'tick')
      .attr('transform', (d) => `translate(${x(d)}, ${0})`);

    this.ticks.select('text').text((d) => (this.format ? this.format(d) : d));
  }

  get stops() {
    const [min, max] = this.extent;
    return ticks(min, max, numTicks);
  }

  get extent() {
    return this.scale.domain();
  }
}
