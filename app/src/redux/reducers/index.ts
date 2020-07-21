import { Action } from 'redux';
import * as H from '../../utils/helpers';
import sectionData from '../../../public/content/narrativeCopy.json';
import { State, AppDataType } from '../../utils/types';
import A from '../actions';
import { VIEWS } from '../../utils/constants';

const initialState: State = {
  sectionData: H.addStepIds(sectionData) as AppDataType,
  swipeData: null,
  stationData: null,
  mapData: null,
  view: VIEWS.BLANK,
};

export default function reducer(state = initialState, action: Action): State {
  switch (action.type) {
    case A.SET_SWIPE_DATA:
      return { ...state, swipeData: action.data };
    case A.SET_STATION_DATA:
      return { ...state, stationData: action.data };
    case A.SET_MAP_DATA:
      return { ...state, mapData: action.data };
    case A.SET_VIEW:
      return { ...state, view: action.view };
    default:
      return state;
  }
}
