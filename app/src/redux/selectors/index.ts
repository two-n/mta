import { Store } from 'redux';
import { createSelector } from 'reselect';
import * as topojson from 'topojson-client';
import {
  rollup,
  extent,
  quantile,
  max,
} from 'd3-array';
import { State, ProcessedStation } from '../../utils/types';
import * as Helpers from '../../utils/helpers';
import { processStations } from '../../utils/dataProcessing';
import { KEYS as K, FORMATTERS as F, appConfig } from '../../utils/constants';

/** Basic Selectors */
export const getSectionData = (state: Store<State>) => state.getState().sectionData;
export const getSwipeData = (state: Store<State>) => state.getState().swipeData;
export const getStationData = (state: Store<State>) => state.getState().stationData;
export const getACSData = (state: Store<State>) => state.getState().acsData;
export const getView = (state: Store<State>) => state.getState().view;

/** Turnstile Manipulations */
export const getFilteredSwipeData = createSelector([
  getSwipeData,
], (data) => data.filter(({ WEEK }) => WEEK >= appConfig.startDate));

export const getOverallTimeline = createSelector([
  getFilteredSwipeData,
], (data) => data && processStations(data, true));

export const getStationRollup = createSelector([
  getFilteredSwipeData,
], (data) => data
&& rollup(data, processStations,
  ({ REMOTE }) => REMOTE));

export const getStationTimelines = createSelector([
  getStationRollup,
], (data) => data
&& Array.from(data).map(([, processStation]: [string, ProcessedStation]) => processStation)
  .map((d:ProcessedStation) => ({
    ...d,
    timeline: d.timeline
      .filter(({ date }) => F.pDate(date) > appConfig.startDate), // filter for only after startDate
  })) as ProcessedStation[]);

/** GEOGRAPHIC TRANSFORMATIONS */
const getACSGeometries = createSelector([
  getACSData,
],
(data) => data.objects.acs_nta.geometries);

export const getGeoJSONData = createSelector([
  getACSData,
], (data) => topojson.feature(data, data.objects.acs_nta));

export const getGeoMeshInterior = createSelector([
  getACSData,
], (data) => topojson.mesh(data, data.objects.acs_nta,
  (a, b) => a !== b));

export const getGeoMeshExterior = createSelector([
  getACSData,
], (data) => topojson.mesh(data, data.objects.acs_nta,
  (a, b) => a === b));


/** EXTENTS */
export const getDataExtents = createSelector([
  getStationTimelines,
  getStationData,
  getACSGeometries,
], (stationStats, stations, acs): {[key:string]: (number|Date| string)[]} => {
  const stationTimelines = stationStats.map(({ timeline }) => timeline);
  return {
    [K.SWIPES_PCT_CHG]: [-1, quantile(stationTimelines
      .map((t) => t
        .map(({ swipes_pct_chg }) => swipes_pct_chg))
      .flat(), 0.999)],
    [K.SUMMARY_SWIPES_PCT_CHG]: [-1, quantile(stationStats
      .map(({ summary }) => summary)
      .map(({ swipes_pct_chg }) => swipes_pct_chg), 0.99)],
    [K.SUMMARY_SWIPES_AVG_POST]: [-1, quantile(stationStats
      .map(({ summary }) => summary)
      .map(({ swipes_avg_post }) => swipes_avg_post), 0.99)],
    [K.BOROUGH]: Helpers.getUnique(stations, (d) => d[K.BOROUGH]),
    [K.ED_HEALTH_PCT]: extent(acs, ({ properties }) => +properties[K.ED_HEALTH_PCT]),
    [K.INCOME_PC]: [0, max(acs, ({ properties }) => +properties[K.INCOME_PC])],
    [K.UNINSURED]: [0, quantile(acs.map(({ properties }) => +properties[K.UNINSURED]), 0.99)],

  };
});

/** creates a map from NTACode => ACS summary data */
export const getStationToACSMap = createSelector([
  getACSGeometries,
], (data) => data
&& new Map(data.map(({ properties }) => ([properties.NTACode, properties]))));
