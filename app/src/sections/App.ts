// pulls in all sections and initializes them
// handles resize for them all
import { selectAll } from "d3-selection"
import * as Stickyfill from "stickyfill";
import { Section1 } from "./Section1";

import data from '../content/data.json';
import { SECTIONS, CLASSES as C } from "../utils/constants";

export class App {
  section1: Section1;
  state: { [key: string]: any }
  constructor() {
    this.state = {
      data
    }
    console.log('initializing App', this.state.data)
  }

  init() {
    const { data } = this.state

    // SECTION 1
    this.section1 = new Section1({ data: data[SECTIONS.S1] })
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