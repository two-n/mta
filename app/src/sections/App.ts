// pulls in all sections and initializes them
// handles resize for them all
import { Section1 } from "./Section1";

import data from '../content/data.json';
import { SECTIONS } from "../utils/constants";

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

    this.section1 = new Section1({ data: data[SECTIONS.S1] })
    this.section1.init();
  }
}