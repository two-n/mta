import { Store } from 'redux';
import { select } from 'd3';
import Section from '../Section/index';
import { SectionDataType, StepDataType } from '../../utils/types';
import {
  SECTIONS as S, DIRECTIONS as D, VIEWS as V, KEYS,
} from '../../utils/constants';
import MovingMap from '../../components/MovingMap/index';

interface Props { data: SectionDataType, store: Store }

export default class SectionMovingMap extends Section {
  [key:string]: any;

  constructor({ data, store }: Props) {
    super({ data, store, sectionName: S.S_MOVING_MAP });
    this.onStepEnter = this.onStepEnter.bind(this);
    this.controller = {
      0: () => this.movingMap.setView(V.BLANK),
      1: () => this.movingMap.setView(V.MAP_OUTLINE),
      2: () => this.movingMap.setView(V.MAP_DOTS_LINES),
      3: () => this.movingMap.setView(V.MAP_DOTS_LINES_NTAS),
      6: () => this.movingMap.setView(V.ZOOM_SOHO),
      7: () => this.movingMap.setView(V.ZOOM_SOHO),
      8: () => this.movingMap.setView(V.ZOOM_BROWNSVILLE),
      9: () => this.movingMap.setView(V.ZOOM_BROWNSVILLE),
      10: () => this.movingMap.setView(V.MAP_DOTS_LINES),
      11: () => this.movingMap.setView(V.SWARM),
      12: (key:string) => this.movingMap.setView(V.SCATTER, key),
      13: (key:string) => this.movingMap.setView(V.SCATTER, key),
      14: (key:string) => this.movingMap.setView(V.SCATTER, key),
      15: (key:string) => this.movingMap.setView(V.SCATTER, key),
      16: (key:string) => this.movingMap.setView(V.SCATTER, key),
    };
    this.init();
  }

  setUpGraphic() {
    this.movingMap = new MovingMap({
      store: this.store,
      parent: this.graphic,
    });
    this.movingMap.init();
  }

  onStepEnter({ element, index, direction }) {
    super.onStepEnter({ element, index, direction });
    if (this.controller[index]) {
      const data = select(element).data()[0] as StepDataType;
      if (data[KEYS.DOT_POSITION] && data[KEYS.DOT_POSITION][KEYS.Y_KEY]) {
        this.controller[index](data[KEYS.DOT_POSITION][KEYS.Y_KEY]);
      } else this.controller[index]();
    }
  }

  handleResize() {
    super.handleResize();
    this.movingMap.handleResize();
  }
}
