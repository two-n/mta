import { csv, autoType } from 'd3';
import { Dispatch } from 'redux';
import { setTurnstileData, setMapData, setStationData } from './creators';
import mapData from './public/content/nta_topo.json';

export const loadTurnstileData = (dispatch: Dispatch) => {
  const path = './public/content/mta_timeseries_daily.csv';
  return csv(path, autoType)
    // @ts-ignore
    .then((data) => dispatch(setTurnstileData(data)))
    .catch((err) => console.error('err in loading turnstile data', err));
};

export const loadStationData = (dispatch: Dispatch) => {
  const path = './public/content/stationsWithTracts.csv';
  return csv(path, autoType)
    // @ts-ignore
    .then((data) => dispatch(setStationData(data)))
    .catch((err) => console.error('err in loading station data', err));
};

export const loadMapData = (dispatch: Dispatch) => new Promise((resolve) => {
  resolve(mapData);
}).then((data) => dispatch(setMapData(data)))
  .catch((err) => console.error('err in loading map data', err));

export default {};
