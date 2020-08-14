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
export const SET_MAP_DATA = 'SET_MAP_DATA';
export const setMapData = (data: any) => ({
  type: SET_MAP_DATA,
  data,
});
export const SET_VIEW = 'SET_VIEW';
export const setView = (view: VIEWS, yKey?: string | null) => ({
  type: SET_VIEW,
  view,
  yKey,
});
export const SET_WEEK = 'SET_WEEK';
export const setWeek = (week: string) => ({
  type: SET_WEEK,
  week,
});
export const SET_LINE = 'SET_LINE';
export const setLine = (line: string) => ({
  type: SET_LINE,
  line,
});
export const SET_NTA = 'SET_NTA';
export const setNTA = (nta: string) => ({
  type: SET_NTA,
  nta,
});
export const SET_LOCATION = 'SET_LOCATION';
export const setLocation = (scrollHash: string) => ({
  type: SET_LOCATION,
  location: scrollHash,
});
