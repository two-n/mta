import './style.scss';
import { StationTimelineItem } from 'src/utils/types';
import { event, ScaleLinear, ScaleSequential } from 'd3';

interface Props {
  parent: Selection
  values: StationTimelineItem[]
  initialIndex: number
  onChange: (newVal: number) => void
  name: string
  description?: string
  colorScale?: ScaleSequential<any>
}

export default class Slider {
  [x: string]: any;

  constructor(props: Props) {
    this.props = props;
    const {
      parent, name, values, initialIndex, description,
    } = this.props;

    this.handleChange = this.handleChange.bind(this);
    this.el = parent.append('div').attr('class', 'Slider');

    this.input = this.el.append('input')
      .attr('type', 'range')
      .attr('name', name)
      .attr('min', 0)
      .attr('max', values.length - 1)
      .attr('value', initialIndex)
      .attr('step', 1)
      .on('change', this.handleChange);

    // TOOD: add text for date above slider
    // TODO: update track gradient with timeline colors

    if (description) {
      this.el.append('div')
        .attr('class', 'description')
        .html(description);
    }
  }

  update(newVal) {
    this.input.node().value = newVal;
  }

  handleChange(d) {
    const { target: { value } } = event;
    const { onChange } = this.props;
    onChange(value);
  }
}
