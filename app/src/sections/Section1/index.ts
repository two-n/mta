import { select } from "d3-selection";
import { SectionDataType } from "../../utils/types";
import "./style.scss";
import { CLASSES as C } from "../../utils/constants";

export class Section1 {
  [x: string]: any;
  data: SectionDataType;
  constructor({ data }: { data: SectionDataType }) {
    this.data = data
  }

  init() {
    const { data } = this

    // create section
    this.el = select("#section1") /** unique to section */
      .attr("class", C.SECTION)

    // create graphic container
    this.sticky = this.el.append("div")
      .attr("class", C.STICKY)

    // create header
    this.sticky.append("h2").attr("class", C.SECTION_HEADER)
      .html(data.title)

    // create header
    this.sticky.append("div")
      .attr("class", C.GRAPHIC) /** unique to section */

    // create steps
    this.steps = this.el
      .append("div")
      .attr("class", C.ARTICLE)
      .selectAll(`.${C.STEP}`).data(data.steps)
      .join("div")
      .attr("class", C.STEP)
      .attr("data-step", d => d.step_id)

    this.steps.append("h3")
      .attr("class", C.STEP_HEADER)
      .html(d => d.header)

    this.steps.append("div")
      .attr("class", C.STEP_TEXT)
      .html(d => d.text)
  }

  resize() {

  }
}