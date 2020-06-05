import { Store } from 'redux';
import Section from '../Section/index';
import { SectionDataType } from '../../utils/types';
import { SECTIONS as S } from '../../utils/constants';
import MovingMap from '../../components/MovingMap/index';

interface Props { data: SectionDataType, store: Store }

export default class SectionMovingMap extends Section {
  [key:string]: any;

  constructor({ data, store }: Props) {
    super({ data, store, sectionName: S.S_MOVING_MAP });
  }

  setUpGraphic() {
    this.movingMap = new MovingMap({
      store: this.store,
      parent: this.graphic,
    });
    this.movingMap.init();
  }

  handleResize() {
    super.handleResize();
    this.movingMap.handleResize();
  }
}
