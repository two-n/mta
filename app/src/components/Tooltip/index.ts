import { Selection } from 'd3';
import { CLASSES as C } from '../../utils/constants';
import './style.scss';

interface Props{
  parent: Selection;
  noTransition?: boolean;
  strokeColor?: string;
}

export default class Tooltip {
  [x: string]: any;

  constructor({ parent, noTransition = false, strokeColor = null }:Props) {
    this.parent = parent;
    this.el = this.parent
      .append('div')
      .attr('class', `Tooltip ${noTransition && 'no-transition'}`)
      .style('border', strokeColor ? `2px solid ${strokeColor}` : null);
  }

  update([x, y], content: string, offsetY = true, flip = false) {
    this.el
      .style('transform', `translate(${x}px, ${y}px)
      ${offsetY ? 'translateY(-100%)' : ''}
      ${flip ? 'translateX(-100%)' : ''}`)
      .html(content);
    this.el.classed(C.VISIBLE, true);
  }

  makeInvisible() {
    this.el.classed(C.VISIBLE, false);
  }
}
