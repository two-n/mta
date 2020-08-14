import { Action } from 'redux';
import * as H from '../../utils/helpers';
import sectionData from '../../../public/content/narrativeCopy.json';
import { State, AppDataType } from '../../utils/types';
import A from '../actions';
import {
  VIEWS, appConfig, FORMATTERS as F, VIEWS as V,
} from '../../utils/constants';

const initialState: State = {
  sectionData: H.addStepIds(sectionData) as AppDataType,
  swipeData: null,
  stationData: null,
  mapData: null,
  view: VIEWS.BLANK,
  location: null,
  yKey: null,
  selectedWeek: F.fWeek(appConfig.initialSelectedDate), // nys on pause
  selectedLine: null,
  selectedNta: null,
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
      return {
        ...state,
        view: action.view,
        yKey: action.yKey || null,
        ...action.view < V.SCATTER // reset selction values for anything before controls show up
          ? { selectedLine: null, selectedNta: null, selectedWeek: initialState.selectedWeek }
          : {},
      };
    case A.SET_WEEK:
      return { ...state, selectedWeek: action.week };
    case A.SET_LINE:
      return { ...state, selectedLine: action.line };
    case A.SET_NTA:
      return { ...state, selectedNta: action.nta };
    case A.SET_LOCATION:
      return { ...state, location: action.location };
    default:
      return state;
  }
}
