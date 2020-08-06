import './style.scss';
import { Store } from 'redux';
import { State } from 'src/utils/types';
import { select } from 'd3';
import {
  CLASSES as C, VIEWS, appConfig, FORMATTERS as F, SECTIONS,
} from '../../utils/constants';
import * as S from '../../redux/selectors';
import * as A from '../../redux/actions/creators';
import Input from '../Input';
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

    this.toggleVisibility = this.toggleVisibility.bind(this);
    this.animateWeeks = this.animateWeeks.bind(this);
    this.findNextWeek = this.findNextWeek.bind(this);
    this.store.subscribe(this.toggleVisibility);
    this.init();
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
      .filter((d) => F.pWeek(d.date) > appConfig.thresholdDate);

    this.play = this.el.append('div').attr('class', 'play-button')
      .html('Play')
      .on('click', this.animateWeeks)
      .append('span')
      .attr('class', 'icon');

    this.slider = new Slider({
      parent: this.el,
      values: this.sliderTimeline,
      initialIndex: this.sliderTimeline.findIndex((d) => d.date === initialWeek),
      onChange: (newIndex:number) => this.store
        .dispatch(A.setWeek(this.sliderTimeline[newIndex].date)),
      name: 'dateSelection',
      colorScale,
    });

    this.el.append('div')
      .attr('class', 'description')
      .html('Use the slider to change the date, or press <strong>play</strong> for animation.');
  }

  animateWeeks() {
    const delay = 500; // millisecnds
    if (this.intervalId) {
      this.resetInterval();
    } else {
      this.play.classed('pause', true);
      this.intervalId = setInterval(this.findNextWeek, delay);
    }
  }

  resetInterval() {
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.play.classed('pause', false);
  }

  findNextWeek() {
    const week = S.getSelectedWeek(this.store.getState());
    const index = this.sliderTimeline.findIndex((d) => d.date === week);
    const isAtEnd = (index === this.sliderTimeline.length - 1);
    const nextWeek = !isAtEnd
      ? this.sliderTimeline[index + 1].date
      : this.sliderTimeline[0].date;
    this.store.dispatch(A.setWeek(nextWeek));
    if (isAtEnd) this.resetInterval(); // turn off at end of dates
  }

  toggleVisibility() {
    const state = this.store.getState();
    const view = S.getView(state);
    this.el.classed(C.VISIBLE, view >= VIEWS.SCATTER
      && !state.location.includes(SECTIONS.S_METHODOLOGY));

    const newWeek = S.getSelectedWeek(state);
    if (this.prevWeek !== newWeek) {
      this.slider // slider takes an index value
        .update(this.sliderTimeline
          .findIndex((d) => d.date === newWeek));
      this.prevWeek = newWeek;
    }
  }
}
