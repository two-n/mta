// pulls in all sections and initializes them
// handles resize for them all
import { Store } from 'redux';
import { selectAll, select } from 'd3';
import * as Stickyfill from 'stickyfill';
import SectionTimeline from './SectionTimeline';
import SectionMovingMap from './SectionMovingMap';
import SectionIntro from './SectionIntro';
import Controls from '../components/Controls';
// import Navigation from '../components/Navigation';

import * as S from '../redux/selectors';
import { State } from '../utils/types';
import { SECTIONS, CLASSES as C, KEYS } from '../utils/constants';
import Title from './Title';

export default class App {
  [x: string]: any;

  store: Store<State, any>

  constructor(store: Store) {
    this.store = store;
    const state = this.store.getState();
    const sectionData = S.getSectionData(state);

    // TITLE
    // load title before data is fully processed
    this.Title = new Title({ data: sectionData[SECTIONS.S_TITLE] });
  }

  init() {
    const state = this.store.getState();
    const sectionData = S.getSectionData(state);

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
    window.addEventListener('unload', () => {
      console.log('unload');
      window.location.hash = '';
    }); // reset window location
    this.checkForHash();
  }

  checkForHash() {
    if (window.location.hash) {
      console.log('window.location.hash', window.location.hash);
      const el = select(`[${KEYS.DATA_STEP}=${window.location.hash.slice(1)}]`).node();
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
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
