import { Action } from 'redux';
import * as H from '../../utils/helpers';
import sectionData from '../../../public/content/narrativeCopy.json';
import { State, AppDataType } from '../../utils/types';
import A from '../actions';
import { VIEWS } from '../../utils/constants';

const initialState: State = {
  sectionData: H.addStepIds(sectionData) as AppDataType,
  swipeData: null,
  mapData: null,
  stationData: null,
  acsData: null,
  view: VIEWS.MAP,
};

export default function reducer(state = initialState, action: Action): State {
  switch (action.type) {
    case A.SET_SWIPE_DATA:
      return { ...state, swipeData: action.data };
    case A.SET_STATION_DATA:
      return { ...state, stationData: action.data };
    case A.SET_ACS_DATA:
      return { ...state, acsData: action.data };
    case A.SET_VIEW:
      return { ...state, view: action.view };
    default:
      return state;
  }
}
