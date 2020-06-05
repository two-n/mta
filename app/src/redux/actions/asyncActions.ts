import { csv } from 'd3-fetch';
import { autoType } from 'd3-dsv';
import { Dispatch } from 'redux';
import {
  setTurnstileData, setMapData, setStationData, setACSData,
} from './creators';
import mapData from '../../content/nta_topo.json';


export const loadTurnstileData = (dispatch: Dispatch) => {
  const path = require('../../content/mta_timeseries_daily.csv');
  return csv(path, autoType)
    // @ts-ignore
    .then((data) => dispatch(setTurnstileData(data)))
    .catch((err) => console.error('err in loading turnstile data', err));
};

export const loadStationData = (dispatch: Dispatch) => {
  const path = require('../../content/stationsWithTracts.csv');
  return csv(path, autoType)
    // @ts-ignore
    .then((data) => dispatch(setStationData(data)))
    .catch((err) => console.error('err in loading station data', err));
};

export const loadACSData = (dispatch: Dispatch) => {
  const path = require('../../content/acsCleaned.csv');
  return csv(path, autoType)
    // @ts-ignore
    .then((data) => dispatch(setACSData(data)))
    .catch((err) => console.error('err in loading acs data', err));
};

export const loadMapData = (dispatch: Dispatch) => new Promise((resolve) => {
  resolve(mapData);
}).then((data) => dispatch(setMapData(data)))
  .catch((err) => console.error('err in loading map data', err));

export default {};
