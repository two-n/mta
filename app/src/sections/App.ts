// pulls in all sections and initializes them
// handles resize for them all
import { Store } from 'redux';
import { selectAll } from 'd3-selection';
import * as Stickyfill from 'stickyfill';
import Section1 from './Section1';
import Section2 from './Section2';

import * as S from '../redux/selectors';
import { State } from '../utils/types';
import { SECTIONS, CLASSES as C } from '../utils/constants';

export default class App {
  section1: Section1;

  section2: Section2;

  store: Store<State, any>

  constructor(store: Store) {
    this.store = store;
  }

  init() {
    const sectionData = S.getSectionData(this.store);
    // SECTION 1
    this.section1 = new Section1({ data: sectionData[SECTIONS.S1], store: this.store });
    this.section1.init();
    // SECTION 2
    this.section2 = new Section2({ data: sectionData[SECTIONS.S2], store: this.store });
    this.section2.init();

    // polyfil for sticky positioning
    this.setupStickyfill();

    // setup resize event
    window.addEventListener('resize', () => this.handleResize());
  }

  handleResize() {
    this.section1.handleResize();
  }

  setupStickyfill() {
    selectAll(`${C.STICKY}`).each(function () {
      Stickyfill.add(this);
    });
  }
}
