import { Store } from 'redux';
import Section from '../Section';
import { SectionDataType, State, Controller } from '../../utils/types';
import { SECTIONS as S, DIRECTIONS as D } from '../../utils/constants';
import './style.scss';
import Timeline from '../../components/Timeline';

interface Props { data: SectionDataType, store: Store }

export default class SectionTimeline extends Section {
  [x: string]: any;

  timeline: Timeline;

  store: Store<State>

  data: SectionDataType;

  controller: Controller;

  constructor({ data, store }: Props) {
    super({ data, store, sectionName: S.S_TIMELINE });
    this.onStepEnter = this.onStepEnter.bind(this);
    this.controller = {
      0: {
        [D.DOWN]: () => this.timeline.animateInLine(),
      },
      2: {
        [D.UP]: () => this.timeline.animateOutLine(),
      },
    };
  }

  setUpGraphic() {
    this.timeline = new Timeline({ parent: this.graphic, store: this.store });
    this.timeline.init();
  }

  onStepEnter({ element, index, direction }) {
    if (this.controller[index]
      && this.controller[index][direction]) {
      this.controller[index][direction]();
    }
  }

  handleResize() {
    super.handleResize();
    this.timeline.handleResize();
  }
}
