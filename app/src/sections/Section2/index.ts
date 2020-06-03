import { Store } from 'redux';
import Section from '../Section';
import { SectionDataType } from '../../utils/types';
import { SECTIONS as S, DIRECTIONS as D } from '../../utils/constants';
import './style.scss';
import FeverGrid from '../../components/FeverLines';

interface Props { data: SectionDataType, store: Store }

export default class Section2 extends Section {
  [x: string]: any;

  constructor({ data, store }: Props) {
    super({ data, store, sectionName: S.S2 });
    this.onStepEnter = this.onStepEnter.bind(this);
  }

  setUpGraphic() {
    this.grid = new FeverGrid({ store: this.store, parent: this.graphic });
    this.grid.init();
  }


  onStepEnter({ element, index, direction }) {
    if (direction === D.DOWN) {
      this.grid.makeGraphsVisible();
    } else {
      this.grid.makeGraphsInVisible();
    }
  }

  handleResize() {
    super.handleResize();
  }
}
