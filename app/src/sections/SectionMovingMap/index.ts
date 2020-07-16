import { Store } from 'redux';
import Section from '../Section/index';
import { SectionDataType } from '../../utils/types';
import { SECTIONS as S, DIRECTIONS as D, VIEWS as V } from '../../utils/constants';
import MovingMap from '../../components/MovingMap/index';

interface Props { data: SectionDataType, store: Store }

export default class SectionMovingMap extends Section {
  [key:string]: any;

  constructor({ data, store }: Props) {
    super({ data, store, sectionName: S.S_MOVING_MAP });
    this.onStepEnter = this.onStepEnter.bind(this);
    this.controller = {
      0: {
        [D.UP]: () => this.movingMap.setView(V.MAP),
      },
      1: {
        [D.DOWN]: () => this.movingMap.setView(V.PCT_CHANGE),
        [D.UP]: () => this.movingMap.setView(V.PCT_CHANGE),
      },
      2: {
        [D.DOWN]: () => this.movingMap.setView(V.BOROUGH),
        [D.UP]: () => this.movingMap.setView(V.BOROUGH),
      },
      3: {
        [D.DOWN]: () => this.movingMap.setView(V.PCT_CHANGE_BOROUGH),
        [D.UP]: () => this.movingMap.setView(V.PCT_CHANGE_BOROUGH),
      },
      4: {
        [D.DOWN]: () => this.movingMap.setView(V.SCATTER_PCT_INCOME),
        [D.UP]: () => this.movingMap.setView(V.SCATTER_PCT_INCOME),
      },
      5: {
        [D.DOWN]: () => this.movingMap.setView(V.SCATTER_ED_HEALTH),
        [D.UP]: () => this.movingMap.setView(V.SCATTER_ED_HEALTH),
      },
      6: {
        [D.DOWN]: () => this.movingMap.setView(V.SCATTER_UNINSURED),
        [D.UP]: () => this.movingMap.setView(V.SCATTER_UNINSURED),
      },
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
    if (this.controller[index]
      && this.controller[index][direction]) {
      this.controller[index][direction]();
    }
  }

  handleResize() {
    super.handleResize();
    this.movingMap.handleResize();
  }
}
