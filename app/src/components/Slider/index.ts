import './style.scss';
import { event, ScaleSequential } from 'd3';
import { StationTimelineItem } from '../../utils/types';
import { FORMATTERS as F } from '../../utils/constants';

interface Props {
  parent: Selection
  values: StationTimelineItem[]
  initialIndex: number
  onChange: (newVal: number) => void
  name: string
  colorScale?: ScaleSequential<any>
}

export default class Slider {
  [x: string]: any;

  constructor(props: Props) {
    this.props = props;
    const {
      parent, name, values, initialIndex,
    } = this.props;

    this.handleChange = this.handleChange.bind(this);
    this.el = parent.append('div').attr('class', 'Slider');


    this.currentWeek = this.el.append('div')
      .attr('class', 'current-date');

    this.input = this.el.append('input')
      .attr('type', 'range')
      .attr('name', name)
      .attr('min', 0)
      .attr('max', values.length - 1)
      .attr('value', initialIndex)
      .attr('step', 1)
      .on('input', this.handleChange);

    this.dates = this.el.append('div').attr('class', 'dates')
      .selectAll('.date')
      .data([values[0].date, values[values.length - 1].date])
      .join('div')
      .attr('class', 'date')
      .html((d) => F.fMonthYr(F.pWeek(d)));
  }

  update(newVal) {
    this.input.node().value = newVal;
    const { values } = this.props;
    const newWeek = values[newVal].date;
    if (newWeek) {
      this.currentWeek
        .html(`Viewing week of: <span>${F.fDayMonth(F.pWeek(newWeek))}</span>`);
    }
  }

  handleChange(d) {
    const { target: { value } } = event;
    const { onChange } = this.props;
    onChange(value);
  }
}
