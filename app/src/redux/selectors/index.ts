import { Store } from 'redux';
import { createSelector } from 'reselect';
import * as topojson from 'topojson-client';
import {
  rollup,
  extent,
  quantile,
  max,
} from 'd3-array';
import { scaleSequential } from 'd3';
import { State, ProcessedStation } from '../../utils/types';
import * as Helpers from '../../utils/helpers';
import { processStations } from '../../utils/dataProcessing';
import {
  KEYS as K, FORMATTERS as F, appConfig, colorInterpolator,
} from '../../utils/constants';

/** Basic Selectors */
// TODO: refactor base selectors to take state instead of store
export const getSectionData = (state: Store<State>) => state.getState().sectionData;
export const getSwipeData = (state: Store<State>) => state.getState().swipeData;
export const getStationData = (state: Store<State>) => state.getState().stationData;
export const getMapData = (state: Store<State>) => state.getState().mapData;
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
    .map((d: ProcessedStation) => ({
      ...d,
      timeline: d.timeline
        .filter(({ date }) => F.pDate(date) > appConfig.startDate), // filter for only after startDate
    })) as ProcessedStation[]);

/** GEOGRAPHIC TRANSFORMATIONS */
export const getMapOutline = createSelector([getMapData], (data) => topojson.feature(data, data.objects['borough-boundaries']));
export const getLinesData = createSelector([getMapData], (data) => topojson.feature(data, data.objects['subway-lines']));

// filter out Staten Island
const getFilteredACSData = createSelector([
  getMapData,
], (data) => ({
  ...data,
  objects: {
    acs_nta: {
      ...data.objects.acs_nta,
      geometries: data.objects.acs_nta.geometries
        .filter(({ properties }) => properties.BoroCode !== 5),
    },
  },
}));

const getACSGeometries = createSelector([
  getFilteredACSData,
], (data) => data.objects.acs_nta.geometries);

export const getGeoJSONData = createSelector([
  getFilteredACSData,
], (data) => topojson.feature(data, data.objects.acs_nta));

export const getGeoMeshInterior = createSelector([
  getFilteredACSData,
], (data) => topojson.mesh(data, data.objects.acs_nta,
  (a, b) => a !== b));

export const getGeoMeshExterior = createSelector([
  getFilteredACSData,
], (data) => topojson.mesh(data, data.objects.acs_nta,
  (a, b) => a === b));


/** EXTENTS */
export const getDataExtents = createSelector([
  getStationTimelines,
  getStationData,
  getACSGeometries,
], (stationStats, stations, acs): { [key: string]: (number | Date | string)[] } => {
  const stationTimelines = stationStats.map(({ timeline }) => timeline);
  return {
    [K.SWIPES_PCT_CHG]: [0, quantile(stationTimelines
      .map((t) => t
        .map(({ swipes_pct_chg }) => swipes_pct_chg))
      .flat(), 0.999)],
    [K.SUMMARY_SWIPES_PCT_CHG]: [0, quantile(stationStats
      .map(({ summary }) => summary)
      .map(({ swipes_pct_chg }) => swipes_pct_chg), 0.99)],
    [K.SUMMARY_SWIPES_AVG_POST]: [-1, quantile(stationStats
      .map(({ summary }) => summary)
      .map(({ swipes_avg_post }) => swipes_avg_post), 0.99)],
    [K.BOROUGH]: Helpers.getUnique(stations, (d) => d[K.BOROUGH]),
    [K.ED_HEALTH_PCT]: extent(acs, ({ properties }) => +properties[K.ED_HEALTH_PCT]),
    [K.INCOME_PC]: [0, max(acs, ({ properties }) => +properties[K.INCOME_PC])],
    [K.UNINSURED]: [0, quantile(acs.map(({ properties }) => +properties[K.UNINSURED]), 0.99)],
    [K.SNAP_PCT]: [0, quantile(acs.map(({ properties }) => +properties[K.SNAP_PCT]), 0.99)],
    [K.WHITE]: [0, quantile(acs.map(({ properties }) => +properties[K.WHITE]), 0.99)],

  };
});

export const getColorScheme = createSelector([
  getDataExtents,
], (extents) => scaleSequential(colorInterpolator)
  .domain(extents[K.SUMMARY_SWIPES_PCT_CHG] as [number, number]));

/** creates a map from NTACode => ACS summary data */
export const getStationToACSMap = createSelector([
  getACSGeometries,
], (data) => data
  && new Map(data.map(({ properties }) => ([properties.NTACode, properties]))));
