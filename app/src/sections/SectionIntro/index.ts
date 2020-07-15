import Section from '../Section';
import { SectionDataType } from '../../utils/types';
import './style.scss';
import { CLASSES as C, SECTIONS } from '../../utils/constants';


interface Props{
  data: SectionDataType;
}
/** Scaffolding for reusable section code */
export default class SectionIntro extends Section {
  [x: string]: any;

  constructor({ data }: Props) {
    super({ data, store: null, sectionName: SECTIONS.S_INTRO });
    this.init();
  }
}
