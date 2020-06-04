import { Store } from 'redux';
import { createSelector } from 'reselect';
import * as topojson from 'topojson-client';
import {
  rollup,
  extent,
  quantile,
} from 'd3-array';
import { State, ProcessedStation } from '../../utils/types';
import * as Helpers from '../../utils/helpers';
import { processStations } from '../../utils/dataProcessing';
import { KEYS as K, FORMATTERS as F, appConfig } from '../../utils/constants';

/** Basic Selectors */
export const getSectionData = (state: Store<State>) => state.getState().sectionData;
export const getTurnstileData = (state: Store<State>) => state.getState().turnstileData;
export const getMapData = (state: Store<State>) => state.getState().mapData;
export const getStationData = (state: Store<State>) => state.getState().stationData;

/** Turnstile Manipulations */
export const getOverallTimeline = createSelector([
  getTurnstileData,
], (data) => data && processStations(data, true));

export const getStationRollup = createSelector([
  getTurnstileData,
], (data) => data
&& rollup(data, processStations, Helpers.getNameHash));

export const getStationTimelines = createSelector([
  getStationRollup,
], (data) => data
&& Array.from(data).map(([, processStation]: [string, ProcessedStation]) => processStation)
  .map((d:ProcessedStation) => ({
    ...d,
    timeline: d.timeline
      .filter(({ date }) => F.pDate(date) > appConfig.startDate), // filter for only after startDate
  })) as ProcessedStation[]);

/** calculates extents for commonly used values */
export const getDataExtents = createSelector([
  getStationTimelines,
], (stationStats): {[key:string]: [number|Date, number|Date]} => {
  const stationTimelines = stationStats.map(({ timeline }) => timeline);
  return {
    date: extent(stationTimelines
      .map((t) => extent(t, ({ date }) => F.pDate(date))).flat()),
    [K.ENTRIES_PCT_CHG]: [-1, quantile(stationTimelines
      .map((t) => t.map(({ entries_pct_chg }) => entries_pct_chg)).flat(), 0.999)],
    [K.MORNING_PCT_CHG]: [-1, quantile(stationTimelines
      .map((t) => t.map(({ morning_pct_chg }) => morning_pct_chg)).flat(), 0.99)],
  };
});

export const getGeoJSONData = createSelector([
  getMapData,
], (data) => topojson.feature(data, data.objects.nta));

export const getGeoMeshInterior = createSelector([
  getMapData,
], (data) => topojson.mesh(data, data.objects.nta,
  (a, b) => a !== b));

export const getGeoMeshExterior = createSelector([
  getMapData,
], (data) => topojson.mesh(data, data.objects.nta,
  (a, b) => a === b));
