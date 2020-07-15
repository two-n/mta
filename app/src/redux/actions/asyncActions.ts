import { autoType, csv } from 'd3';
import { Dispatch } from 'redux';
import {
  setSwipeData, setStationData, setACSData,
} from './creators';
import acsData from '../../../public/content/acs_nta_topo.json';

export const loadSwipeData = (dispatch: Dispatch) => {
  const path = './content/mta_swipes_weekly.csv';
  return csv(path, autoType)
    // @ts-ignore
    .then((data) => dispatch(setSwipeData(data)))
    .catch((err) => console.error('err in loading MTA swipe data data', err));
};

export const loadStationData = (dispatch: Dispatch) => {
  const path = './content/stations_with_ntas.csv';
  return csv(path, autoType)
    // @ts-ignore
    .then((data) => dispatch(setStationData(data)))
    .catch((err) => console.error('err in loading station data', err));
};

export const loadACSData = (dispatch: Dispatch) => new Promise((resolve) => {
  resolve(acsData);
}).then((data) => dispatch(setACSData(data)))
  .catch((err) => console.error('err in loading acs data', err));

export default {};
