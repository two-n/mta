import { Store } from 'redux';
import Section from '../Section';
import { SectionDataType } from '../../utils/types';
import { SECTIONS as S, DIRECTIONS as D } from '../../utils/constants';
import BarTimeline from '../../components/BarTimeline';
import './style.scss';

interface Props { data: SectionDataType, store: Store }

export default class SectionTimeline extends Section {
  [x: string]: any;

  constructor({ data, store }: Props) {
    super({ data, store, sectionName: S.S_TIMELINE });
    this.onStepEnter = this.onStepEnter.bind(this);
    this.init();
  }

  setUpGraphic() {
    this.timeline = new BarTimeline({ parent: this.graphic, store: this.store });
    this.timeline.init();
  }

  onStepEnter({ element, index, direction }) {
    // call parent's handler first - handles the default scrolly-telling mechanisms
    super.onStepEnter({ element, index, direction });
    this.timeline.handleTransition(element, index, direction);
  }

  handleResize() {
    super.handleResize();
    this.timeline.handleResize();
  }
}
