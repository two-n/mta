import { TurnstileData } from '../../utils/types';
import { VIEWS } from '~utils/constants';

export const SET_TURNSTILE_DATA = 'SET_TURNSTILE_DATA';
export const setTurnstileData = (data: TurnstileData[]) => ({
  type: SET_TURNSTILE_DATA,
  data,
});

export const SET_MAP_DATA = 'SET_MAP_DATA';
export const setMapData = (data: any) => ({
  type: SET_MAP_DATA,
  data,
});
export const SET_STATION_DATA = 'SET_STATION_DATA';
export const setStationData = (data: any) => ({
  type: SET_STATION_DATA,
  data,
});
export const SET_ACS_DATA = 'SET_ACS_DATA';
export const setACSData = (data: any) => ({
  type: SET_ACS_DATA,
  data,
});
export const SET_VIEW = 'SET_VIEW';
export const setView = (view: VIEWS) => ({
  type: SET_VIEW,
  view,
});
