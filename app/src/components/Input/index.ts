
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

  constructor(props:Props) {
    const { customClass, options, parent } = props;
    this.props = props; // save for later use
    this.onChange = this.onChange.bind(this);

    this.el = parent.append('div')
      .attr('class', `Input ${customClass}`);

    this.input = this.el.append('input')
      .on('change', this.onChange);

    this.list = this.el.append('ul');

    this.list.selectAll('li')
      .data(options, (d) => d.key)
      .join('li')
      .html((d) => d.content);
  }

  onChange() {
    console.log('this', this, event);
  }
}
