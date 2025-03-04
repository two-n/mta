import { createSelector } from 'reselect';
import * as topojson from 'topojson-client';
import bbox from '@turf/bbox';
import {
  rollup,
  extent,
  quantile,
  max,
  min,
  mean,
} from 'd3-array';
import {
  geoContains, ascending, scaleSequential,
} from 'd3';
import { State, StationData } from '../../utils/types';
import * as Helpers from '../../utils/helpers';
import { processStations } from '../../utils/dataProcessing';
import {
  KEYS as K, appConfig, colorInterpolator,
  VIEWS as V, FORMATTERS as F,
} from '../../utils/constants';

/** Basic Selectors */
// TODO: refactor base selectors to take state instead of store
export const getSectionData = (state: State) => state.sectionData;
export const getSwipeData = (state: State) => state.swipeData;
export const getStationData = (state: State) => state.stationData;
export const getMapData = (state: State) => state.mapData;
export const getView = (state: State) => state.view;
export const getYKey = (state: State) => state.yKey;
export const getSelectedWeek = (state: State) => state.selectedWeek;
export const getSelectedLine = (state: State) => state.selectedLine;
export const getSelectedNta = (state: State) => state.selectedNta;

/** Turnstile Manipulations */
export const getFilteredSwipeData = createSelector([
  getSwipeData,
], (data) => data.filter(({ WEEK }) => WEEK >= appConfig.startDate));

export const getOverallTimeline = createSelector([
  getFilteredSwipeData,
], (data) => {
  if (data) {
    const obj = processStations(data, true);
    return {
      ...obj,
      timeline: [...obj.timeline].map(([, val]) => val)
        .sort((a, b) => ascending(F.pWeek(a.date), F.pWeek(b.date))),
    };
  }
});

export const getStationRollup = createSelector([
  getFilteredSwipeData,
], (data) => data
  && rollup(data, processStations,
    ({ REMOTE }) => REMOTE));

/** GEOGRAPHIC TRANSFORMATIONS */
export const getMapOutline = createSelector([getMapData],
  (data) => topojson.feature(data, data.objects.mapOutline));

export const getLinesData = createSelector([getMapData],
  (data) => topojson.feature(data, data.objects['subway-lines']));

const getACSGeometries = createSelector([
  getMapData,
], (data) => data.objects.acs_nta.geometries);

export const getNTAFeatures = createSelector([
  getMapData,
], (data) => topojson.feature(data, data.objects.acs_nta));


/** EXTENTS */
/** Returns an object {extents: {
 * [key]: [data extent]
 * }, averages: {
 * [key]: mean data value
 * }} */
export const getDemoDataExtents = createSelector([
  getStationData,
  getACSGeometries,
], (stations, acs):{
  'extents':{
    [key: string]: (number | Date | string)[]
  },
  'averages':{
    [key: string]: number
  },
} => ({
  extents: {
    [K.BOROUGH]: Helpers.getUnique(stations, (d) => d[K.BOROUGH]),
    [K.ED_HEALTH_PCT]: extent(acs, ({ properties }) => +properties[K.ED_HEALTH_PCT]),
    [K.INCOME_PC]: [0, max(acs, ({ properties }) => +properties[K.INCOME_PC])],
    [K.UNINSURED]: [0, quantile(acs.map(({ properties }) => +properties[K.UNINSURED]), 0.99)],
    [K.SNAP_PCT]: [0, quantile(acs.map(({ properties }) => +properties[K.SNAP_PCT]), 0.99)],
    [K.WHITE]: [0, quantile(acs.map(({ properties }) => +properties[K.WHITE]), 0.99)],
    [K.NON_WHITE]: [0, quantile(acs.map(({ properties }) => +properties[K.NON_WHITE]), 0.99)],
  },
  averages: {
    [K.ED_HEALTH_PCT]: mean(acs, ({ properties }) => +properties[K.ED_HEALTH_PCT]),
    [K.INCOME_PC]: mean(acs, ({ properties }) => +properties[K.INCOME_PC]),
    [K.UNINSURED]: mean(acs, ({ properties }) => +properties[K.UNINSURED]),
    [K.SNAP_PCT]: mean(acs, ({ properties }) => +properties[K.SNAP_PCT]),
    [K.WHITE]: mean(acs, ({ properties }) => +properties[K.WHITE]),
    [K.NON_WHITE]: mean(acs, ({ properties }) => +properties[K.NON_WHITE]),
  },
}));

export const getWeeklyData = createSelector([
  getSelectedWeek,
  getStationRollup,
], (week, stationStats) => [...stationStats].map(([, { timeline }]) => timeline.get(week)));


export const getWeeklyDataExtent = createSelector([
  getSelectedWeek,
  getStationRollup,
], (week, stationStats): {extent: number[], average: number} => {
  const currentWeekSwipes = [...stationStats].map(([, { timeline }]) => timeline.get(week)).map((d) => d && d.swipes_pct_chg);
  return {
    extent: [quantile(currentWeekSwipes, 0.001),
      quantile(currentWeekSwipes, 0.999)],
    average: mean(currentWeekSwipes),
  };
});

const getSummarySwipeExtent = createSelector([
  getStationRollup,
], (stationStats) => ([
  min([...stationStats]
    .map(([, val]) => val)
    .map(({ summary }) => summary.swipes_pct_chg)),
  quantile(
    [...stationStats]
      .map(([, val]) => val)
      .map(({ summary }) => summary.swipes_pct_chg), 0.99,
  )]));

/** color should be stable throughout the app  */
export const getColorScheme = createSelector([
  getSummarySwipeExtent,
], (e) => scaleSequential(colorInterpolator)
  .domain(e as [number, number])
  .clamp(true));

/** creates a map from NTACode => ACS summary data */
export const getStationToACSMap = createSelector([
  getACSGeometries,
], (data) => data
  && new Map(data.map(({ properties }) => ([properties.NTACode, properties]))));

// get bounding boxes surounding each focus neighborhood
export const getNTAMap = createSelector([
  getStationData,
  getStationRollup,
  getNTAFeatures,
], (stations, swipes, ntas) => {
  // helper function to grab relevant stations and return their average percent change
  const getAvgPctChg = (nta) => {
    const relevantStations = stations.filter((d) => d.NTACode === nta.properties.NTACode);
    return mean(relevantStations
      .map((d) => swipes.get(d.unit)
      && swipes.get(d.unit).summary.swipes_pct_chg));
  };

  return new Map(ntas.features.map((nta) => ([nta.properties.NTACode, {
    ...nta,
    properties: { ...nta.properties, [K.SWIPES_PCT_CHG]: getAvgPctChg(nta) },
  }])));
});

// UNIQUE VALUES
export const getUniqueLines = createSelector([
  getStationData,
], (data) => data && [
  ...new Set(data
    .map((d:StationData) => d.line_name && d.line_name
      .toString()
      .split(''))
    .flat()),
].sort());

export const getUniqueNTAs = createSelector([
  getStationData,
], (data) => data && [
  ...new Map(data
    .map((d:StationData) => ([d.NTACode, d.NTAName]))),
].map(([key, name]) => ({ key, name })).sort((a, b) => ascending(a.name, b.name)));
