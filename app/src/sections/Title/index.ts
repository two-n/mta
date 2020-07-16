import { select } from 'd3';
import 'intersection-observer';
import { SectionDataType } from '../../utils/types';
import './style.scss';
import { CLASSES as C, SECTIONS } from '../../utils/constants';

interface Props{
  data: SectionDataType;
}
/** Scaffolding for reusable section code */
export default class Title {
  [x: string]: any;

  data: SectionDataType;

  constructor({ data }: Props) {
    this.data = data;
    this.section = SECTIONS.S_TITLE;
    this.el = select('#app').append('section')
      .attr('id', `${this.section}`) /** unique to section */
      .attr('class', C.SECTION);

    this.el.append('h1').attr('class', C.TITLE).text(this.data.title);
    this.el.append('h3').attr('class', C.SUBTITLE).text(this.data.subtitle);
  }
}
