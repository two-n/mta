import './style.scss';
import { Store } from 'redux';
import { State } from 'src/utils/types';
import { select } from 'd3';
import { CLASSES as C, VIEWS } from '../../utils/constants';
import * as S from '../../redux/selectors';
import * as A from '../../redux/actions/creators';
import Input from '../Input';
import TimelineFilter from '../TimelineFilter';

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
  }

  init() {
    this.el = select('#app')
      .append('div')
      .attr('id', 'controls');

    // TODO: pull selector for distinct list of lines
    // TODO: write function to create swatches
    // TODO: create array of {key: lineName, content: createSwatch(lineName)}
    this.LineInput = new Input({
      parent: this.el,
      customClass: 'line',
    });

    // TODO: create selector for unique NTAs
    // TODO: create array of {key: ntaCode, content: NTAName}
    this.NTAInput = new Input({
      parent: this.el,
      customClass: 'nta',
    });


    const { timeline } = S.getOverallTimeline(this.state);
    const initialWeek = S.getSelectedWeek(this.state);
    this.timelineFilter = new TimelineFilter({
      parent: this.el,
      timeline,
      initialWeek,
      updateWeek: (week:string) => this.store.dispatch(A.setWeek(week)),
    });
  }

  toggleVisibility() {
    const state = this.store.getState();
    const view = S.getView(state);
    this.el.classed(C.VISIBLE, view >= VIEWS.SWARM);
  }
}
