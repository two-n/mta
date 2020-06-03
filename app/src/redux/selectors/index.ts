import { Store } from 'redux';
import { createSelector } from 'reselect';
// @ts-ignore - no def for rollups
import { rollups } from 'd3-array';
import { State } from '../../utils/types';
import * as Helpers from '../../utils/helpers';
import { processStations } from '../../utils/dataProcessing';

/** Basic Selectors */
export const getSectionData = (state: Store<State>) => state.getState().sectionData;
export const getTurnstileData = (state: Store<State>) => state.getState().turnstileData;

/** Turnstile Manipulations */
export const getOverallTimeline = createSelector([
  getTurnstileData,
], (data) => data && processStations(data, true));

export const getStationTimelines = createSelector([
  getTurnstileData,
], (data) => data && rollups(data, processStations, Helpers.getNameHash));
