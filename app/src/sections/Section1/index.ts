import { Store } from 'redux';
import { Selection } from 'd3-selection';
import Section from '../Section';
import { SectionDataType, State } from '../../utils/types';
import { SECTIONS as S } from '../../utils/constants';
import './style.scss';
import Timeline from '../../components/Timeline';

interface Props { data: SectionDataType, store: Store }

export default class Section1 extends Section {
  timeline: Timeline;

  store: Store<State>

  data: SectionDataType;

  scroller: any;

  el: Selection;

  sticky:Selection;

  graphic:Selection;

  steps: Selection;

  constructor({ data, store }: Props) {
    super({ data, store, sectionName: S.S1 });
  }

  setUpGraphic() {
    this.timeline = new Timeline({ parent: this.graphic, store: this.store });
    this.timeline.init();
  }

  handleResize() {
    super.handleResize();
    this.timeline.handleResize();
  }
}
