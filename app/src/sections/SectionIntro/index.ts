import { Store } from 'redux';
import Section from '../Section';
import { SectionDataType, State } from '../../utils/types';
import './style.scss';
import { CLASSES as C, SECTIONS } from '../../utils/constants';


interface Props{
  data: SectionDataType;
  store: Store<State>
}
/** Scaffolding for reusable section code */
export default class SectionIntro extends Section {
  [x: string]: any;

  constructor({ data, store }: Props) {
    super({ data, store, sectionName: SECTIONS.S_INTRO });
    this.init();
  }
}
