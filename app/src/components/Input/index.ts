
import './style.scss';
import { Selection, event, select } from 'd3';
import autoComplete from '@tarekraafat/autocomplete.js';

interface Props {
  parent: Selection;
  customClass?: string;
  updateVal: (newVal: string) => void;
  options: {key: string, name: string, content?: string}[];
  placeholderText?: string;
}

export default class Input {
  [x: string]: any;

  constructor(props:Props) {
    const {
      customClass, options, parent, placeholderText,
    } = props;
    this.props = props; // save for later use

    this.el = parent.append('div')
      .attr('class', `Input ${customClass}`);

    this.input = this.el.append('input')
      .attr('class', `${customClass}`);

    this.autocomplete = new autoComplete({
      data: {
        src: options,
        key: ['name'],
      },
      trigger: {
        event: ['input', 'focusin', 'focusout'],
        // open whenever element is in focus
        condition: () => document.activeElement === this.input.node(),
      },
      highlight: true,
      placeHolder: placeholderText,
      searchEngine: 'loose',
      selector: `input.${customClass}`,
      resultsList: {
        render: true,
      },
      resultItem: {
        content: (data, source) => {
          console.log('data, source', data, source);
          select(source).html(`${data.match} ${data.value.content || ''}`);
        },
        element: 'li',
      },
      onSelection: (feedback) => {
        console.log('feedback', feedback);
      },
    });
  }
}
