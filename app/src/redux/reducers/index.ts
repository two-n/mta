import { Action } from 'redux';
import { State } from '../../utils/types';
import sectionData from '../../content/sectionData.json';
import A from '../actions';
import { VIEWS } from '~utils/constants';

const initialState: State = {
  sectionData,
  turnstileData: null,
  mapData: null,
  stationData: null,
  view: VIEWS.MAP,
};

export default function reducer(state = initialState, action: Action): State {
  switch (action.type) {
    case A.SET_TURNSTILE_DATA:
      return { ...state, turnstileData: action.data };
    case A.SET_MAP_DATA:
      return { ...state, mapData: action.data };
    case A.SET_STATION_DATA:
      return { ...state, stationData: action.data };
    case A.SET_VIEW:
      return { ...state, view: action.view };
    default:
      return state;
  }
}
