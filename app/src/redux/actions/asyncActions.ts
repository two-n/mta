import { autoType, csv } from 'd3';
import { Dispatch } from 'redux';
import * as C from './creators';
import mapData from '../../../public/content/mapData_topo.json';

export const loadSwipeData = (dispatch: Dispatch) => {
  const path = './content/mta_swipes_weekly.csv';
  return csv(path, autoType)
    // @ts-ignore
    .then((data) => dispatch(C.setSwipeData(data)))
    .catch((err) => console.error('err in loading MTA swipe data data', err));
};

export const loadStationData = (dispatch: Dispatch) => {
  const path = './content/stations_with_ntas.csv';
  return csv(path, autoType)
    // @ts-ignore
    .then((data) => dispatch(C.setStationData(data)))
    .catch((err) => console.error('err in loading station data', err));
};

export const loadMapData = (dispatch: Dispatch) => new Promise((resolve) => {
  resolve(mapData);
}).then((data) => dispatch(C.setMapData(data)))
  .catch((err) => console.error('err in loading map data', err));

export default {};
