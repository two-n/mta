import { TurnstileData } from '../../utils/types';

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
