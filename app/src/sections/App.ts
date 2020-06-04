// pulls in all sections and initializes them
// handles resize for them all
import { Store } from 'redux';
import { selectAll } from 'd3-selection';
import * as Stickyfill from 'stickyfill';
import SectionTimeline from './SectionTimeline';
import SectionPctChange from './SectionPctChange';

import * as S from '../redux/selectors';
import { State } from '../utils/types';
import { SECTIONS, CLASSES as C } from '../utils/constants';

export default class App {
  SectionTimeline: SectionTimeline;

  SectionPctChange: SectionPctChange;

  store: Store<State, any>

  constructor(store: Store) {
    this.store = store;
  }

  init() {
    const sectionData = S.getSectionData(this.store);
    // SECTION 1
    this.SectionTimeline = new SectionTimeline({
      data: sectionData[SECTIONS.S_TIMELINE],
      store: this.store,
    });
    this.SectionTimeline.init();
    // SECTION 2
    this.SectionPctChange = new SectionPctChange({
      data: sectionData[SECTIONS.S_PCT_CHNG],
      store: this.store,
    });
    this.SectionPctChange.init();

    // polyfil for sticky positioning
    this.setupStickyfill();

    // setup resize event
    window.addEventListener('resize', () => this.handleResize());
  }

  handleResize() {
    this.SectionTimeline.handleResize();
  }

  setupStickyfill() {
    selectAll(`${C.STICKY}`).each(function () {
      Stickyfill.add(this);
    });
  }
}
