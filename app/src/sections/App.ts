// pulls in all sections and initializes them
// handles resize for them all
import { Store } from "redux";
import { selectAll } from "d3-selection"
import * as Stickyfill from "stickyfill";
import { Section1 } from "./Section1";

import { getSectionData } from "../redux/selectors";
import A from "../redux/actions";
import { State } from "../utils/types";
import { SECTIONS, CLASSES as C } from "../utils/constants";

export class App {
  section1: Section1;
  store: Store<State, any>

  constructor(store: Store) {
    this.store = store
  }

  init() {
    A.loadTurnstileData(this.store.dispatch)
    const sectionData = getSectionData(this.store)
    // SECTION 1
    this.section1 = new Section1({ data: sectionData[SECTIONS.S1], store: this.store })
    this.section1.init();

    // polyfil for sticky positioning
    this.setupStickyfill()

    // setup resize event
    window.addEventListener("resize", () => this.handleResize());
  }

  handleResize() {
    this.section1.handleResize()
  }

  setupStickyfill() {
    selectAll(`${C.STICKY}`).each(function () {
      Stickyfill.add(this);
    });
  }

}