import './style.scss';
import { Store } from 'redux';
import { State } from 'src/utils/types';
import { select } from 'd3';
import {
  CLASSES as C, VIEWS, appConfig, FORMATTERS as F,
} from '../../utils/constants';
import * as S from '../../redux/selectors';
import * as A from '../../redux/actions/creators';
import Input from '../Input';
import TimelineFilter from '../TimelineFilter';
import { LineSwatch } from '../LineSwatch';
import Slider from '../Slider';

interface Props {
  store: Store<State>
}

export default class Controls {
  [x: string]: any;

  store : Store<State>

  constructor({ store }:Props) {
    this.store = store;
    this.state = store.getState();
    this.init();

    this.toggleVisibility = this.toggleVisibility.bind(this);
    this.store.subscribe(this.toggleVisibility);
  }

  init() {
    this.el = select('#app')
      .append('div')
      .attr('id', 'controls');

    const lines = S.getUniqueLines(this.state);
    const lineOptions = lines.map((l) => ({ key: l, name: l, content: `${LineSwatch(l)}` }));
    this.LineInput = new Input({
      parent: this.el,
      customClass: 'line',
      options: lineOptions,
      placeholderText: 'select line',
      updateVal: (line) => this.store.dispatch(A.setLine(line)),
    });

    const ntaOptions = S.getUniqueNTAs(this.state);
    this.NTAInput = new Input({
      parent: this.el,
      customClass: 'nta',
      options: ntaOptions,
      placeholderText: 'select neighborhood',
      updateVal: (nta) => this.store.dispatch(A.setNTA(nta)),
    });


    const { timeline } = S.getOverallTimeline(this.state);
    const colorScale = S.getColorScheme(this.state);
    const initialWeek = S.getSelectedWeek(this.state);

    this.sliderTimeline = timeline
      .filter((d) => F.pWeek(d.date) >= appConfig.thresholdDate);

    this.slider = new Slider({
      parent: this.el,
      values: this.sliderTimeline,
      initialIndex: this.sliderTimeline.findIndex((d) => d.date === initialWeek),
      onChange: (newIndex:number) => this.store.dispatch(A.setWeek(this.sliderTimeline[newIndex].date)),
      name: 'dateSelection',
      description: 'Use the slider to change the date, or press <strong>play</strong> for animation.',
      colorScale,
    });
  }

  toggleVisibility() {
    const state = this.store.getState();
    const view = S.getView(state);
    const newWeek = S.getSelectedWeek(state);
    this.el.classed(C.VISIBLE, view >= VIEWS.SCATTER && view < VIEWS.METHODOLOGY);
    // TODO: update slider here based on play button
    this.slider.update(this.sliderTimeline
      .findIndex((d) => d.date === newWeek));
  }
}
