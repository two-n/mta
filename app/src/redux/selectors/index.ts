import { Store } from 'redux';
import { createSelector } from 'reselect';
// @ts-ignore - no def for rollups
import { rollups } from 'd3-array';
import { State } from '../../utils/types';
import * as Helpers from '../../utils/helpers';

/** Basic Selectors */
export const getSectionData = (state: Store<State>) => state.getState().sectionData;
export const getTurnstileData = (state: Store<State>) => state.getState().turnstileData;

/** Turnstile Manipulations */
export const getStationTimelines = createSelector([
  getTurnstileData,
], (data) => data && rollups(data, Helpers.processStations, Helpers.getNameHash));
