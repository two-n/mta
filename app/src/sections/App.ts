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
import * as A from '../redux/actions/creators';
import { State } from '../utils/types';
import { SECTIONS, CLASSES as C, KEYS } from '../utils/constants';
import Title from './Title';
import Methodology from './Methodology';

const KEEP_SCROLLING = 'Keep scrolling ↓';
const SCROLL_TO_TOP = 'Jump to top ↑';

export default class App {
  [x: string]: any;

  store: Store<State, any>

  constructor(store: Store) {
    this.store = store;
    const state = this.store.getState();
    const sectionData = S.getSectionData(state);

    this.handleStateChange = this.handleStateChange.bind(this);
    this.handleScrollClick = this.handleScrollClick.bind(this);

    // TITLE
    // load title before data is fully processed
    this.Title = new Title({ data: sectionData[SECTIONS.S_TITLE] });
  }

  init() {
    const state = this.store.getState();
    const sectionData = S.getSectionData(state);

    // INTRO
    this.SectionIntro = new SectionIntro({
      data: sectionData[SECTIONS.S_INTRO],
      store: this.store,
    });

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

    this.Methodology = new Methodology({
      data: sectionData[SECTIONS.S_METHODOLOGY],
    });

    this.ScrollHelp = select('#app')
      .append('div')
      .attr('class', 'scroll-prompt-wrapper')
      .append('div')
      .attr('class', 'scroll-prompt')
      .on('click', this.handleScrollClick);

    // polyfil for sticky positioning
    this.setupStickyfill();

    // listen for state updates
    this.store.subscribe(this.handleStateChange);

    // setup resize event
    window.addEventListener('resize', () => this.handleResize());
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

  handleStateChange() {
    const { location } = this.store.getState();
    if (location) {
      window.location.hash = location;
    }

    this.ScrollHelp
      .classed(C.VISIBLE, !!location)// visible when after first page
      .classed('bottom', location && location.includes('intro'))
      .html((location && location.includes('intro')) // /find best proxy for first section
        ? KEEP_SCROLLING
        : SCROLL_TO_TOP);
  }

  handleScrollClick() {
    const { location } = this.store.getState();

    if (location && !location.includes('intro')) {
      const el = select(`#${SECTIONS.S_TITLE}`).node();
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        this.store.dispatch(A.setLocation(null));
      }
    }
  }

  setupStickyfill() {
    selectAll(`${C.STICKY}`).each(function () {
      Stickyfill.add(this);
    });
  }
}
