// pulls in all sections and initializes them
// handles resize for them all
import { Store } from 'redux';
import { selectAll } from 'd3';
import * as Stickyfill from 'stickyfill';
import SectionTimeline from './SectionTimeline';
import SectionMovingMap from './SectionMovingMap';
import SectionIntro from './SectionIntro';
import Controls from '../components/Controls';
import Navigation from '../components/Navigation';

import * as S from '../redux/selectors';
import { State } from '../utils/types';
import { SECTIONS, CLASSES as C } from '../utils/constants';
import Title from './Title';

export default class App {
  [x: string]: any;

  store: Store<State, any>

  constructor(store: Store) {
    this.store = store;
  }

  init() {
    const state = this.store.getState();
    const sectionData = S.getSectionData(state);

    // TITLE
    this.Title = new Title({ data: sectionData[SECTIONS.S_TITLE] });

    this.Naviation = new Navigation({
      sections: sectionData,
    });

    // INTRO
    this.SectionIntro = new SectionIntro({ data: sectionData[SECTIONS.S_INTRO] });

    // SECTION 1
    this.SectionTimeline = new SectionTimeline({
      data: sectionData[SECTIONS.S_TIMELINE],
      store: this.store,
    });

    // SECTION 2
    this.SectionMovingMap = new SectionMovingMap({
      data: sectionData[SECTIONS.S_MOVING_MAP],
      store: this.store,
    });

    this.Controls = new Controls({
      store: this.store,
    });


    // polyfil for sticky positioning
    this.setupStickyfill();

    // setup resize event
    window.addEventListener('resize', () => this.handleResize());
  }

  handleResize() {
    this.SectionTimeline.handleResize();
    this.SectionMovingMap.handleResize();
  }

  setupStickyfill() {
    selectAll(`${C.STICKY}`).each(function () {
      Stickyfill.add(this);
    });
  }
}
