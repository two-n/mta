import { Store } from 'redux';
import { select } from 'd3';
import * as A from '../../redux/actions/creators';
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
      0: () => store.dispatch(A.setView(V.BLANK)),
      1: () => store.dispatch(A.setView(V.MAP_OUTLINE)),
      2: () => store.dispatch(A.setView(V.MAP_DOTS_LINES)),
      3: () => store.dispatch(A.setView(V.MAP_DOTS_LINES_NTAS)),
      6: () => store.dispatch(A.setView(V.ZOOM_SOHO)),
      7: () => store.dispatch(A.setView(V.ZOOM_SOHO)),
      8: () => store.dispatch(A.setView(V.ZOOM_BROWNSVILLE)),
      9: () => store.dispatch(A.setView(V.ZOOM_BROWNSVILLE)),
      10: () => store.dispatch(A.setView(V.MAP_DOTS_LINES)),
      11: () => store.dispatch(A.setView(V.SWARM)),
      12: (key:string) => store.dispatch(A.setView(V.SCATTER, key)),
      13: (key:string) => store.dispatch(A.setView(V.SCATTER, key)),
      14: (key:string) => store.dispatch(A.setView(V.SCATTER, key)),
      15: (key:string) => store.dispatch(A.setView(V.SCATTER, key)),
      16: (key:string) => store.dispatch(A.setView(V.SCATTER, key)),
      17: () => store.dispatch(A.setView(V.MAP_WITH_CONTROLS)),
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
