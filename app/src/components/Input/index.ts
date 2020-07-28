
import './style.scss';
import { Selection, event } from 'd3';

interface Props {
  parent: Selection;
  customClass?: string;
  updateVal: (newVal: string) => void;
  options: {key: string, content: string}[];
  placeholderText?: string;
}

export default class Input {
  [x: string]: any;

  constructor({ parent, customClass }:Props) {
    this.onChange = this.onChange.bind(this);

    this.el = parent.append('div')
      .attr('class', `Input ${customClass}`);

    this.input = this.el.append('input')
      .on('change', this.onChange);
  }

  onChange() {
    console.log('this', this, event);
  }
}
