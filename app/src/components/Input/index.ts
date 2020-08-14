
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
      customClass, options, parent, placeholderText, updateVal,
    } = props;
    this.props = props; // save for later use

    this.el = parent.append('div')
      .attr('class', `Input ${customClass}`);

    this.input = this.el.append('input')
      .attr('class', `${customClass}`);

    this.display = this.el.append('div')
      .attr('class', 'display');


    this.close = this.el.append('div').attr('class', 'close')
      .on('click', () => {
        // reset value
        this.display.html('');
        this.input.node().value = '';
        updateVal(null);
      });

    // configure 'autoComplete' component
    this.autocomplete = new autoComplete({
      data: {
        src: options,
        key: ['name'],
      },
      trigger: {
        event: ['input', 'focusin', 'focusout'],
        // condition to trigger autocomplete search
        // open whenever element is in focus
        condition: () => document.activeElement === this.input.node(),
      },
      highlight: true,
      placeHolder: placeholderText,
      searchEngine: 'loose',
      maxResults: options.length,
      selector: `input.${customClass}`,
      resultsList: {
        render: true,
      },
      resultItem: {
        content: (data, source) => {
          select(source).html(`<div>${data.match} ${data.value.content || ''}</div>`);
        },
        element: 'li',
      },
      onSelection: (feedback) => {
        // when hit enter
        const { value: { content, name, key } } = feedback.selection;
        this.display.html(content || name);
        this.input.node().value = ' ';
        if (key) updateVal(key);
      },
    });
  }
}
