import { Selection } from 'd3';
import { CLASSES as C } from '../../utils/constants';
import './style.scss';

interface Props{
  parent: Selection;
  noTransition?: boolean;
  strokeColor?: string;
}

const P = 10; // tooltip padding
const I = 10; // inset
export default class Tooltip {
  [x: string]: any;

  constructor({ parent, noTransition = false, strokeColor = null }:Props) {
    this.parent = parent;
    this.el = this.parent
      .append('div')
      .attr('class', `Tooltip ${noTransition && 'no-transition'}`)
      .style('border', strokeColor ? `2px solid ${strokeColor}` : null);

    this.tail = this.el.append('svg').attr('class', 'tail')
      .attr('width', '100%')
      .attr('height', '100%');

    this.tail.append('path')
      .attr('d', `M 0, 0 L ${P}, ${P + I} L ${P + I}, ${P} Z`);

    this.content = this.el.append('div')
      .attr('class', 'content')
      .style('margin', `${P}px`);
  }

  update([x, y], content: string, offsetY = true, flip = false) {
    this.el
      .style('transform', `translate(${x}px, ${y}px)
      ${offsetY ? 'translateY(-100%)' : ''}
      ${flip ? 'translateX(-100%)' : ''}`);

    this.tail.style('transform', `scale(${flip ? -1 : 1}, ${offsetY ? -1 : 1})`);
    this.content.html(content);

    this.el.classed(C.VISIBLE, true);
  }

  makeInvisible() {
    this.el.classed(C.VISIBLE, false);
  }
}
