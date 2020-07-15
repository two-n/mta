import { SwipeData } from '../../utils/types';
import { VIEWS } from '../../utils/constants';

export const SET_SWIPE_DATA = 'SET_SWIPE_DATA';
export const setSwipeData = (data: SwipeData[]) => ({
  type: SET_SWIPE_DATA,
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
