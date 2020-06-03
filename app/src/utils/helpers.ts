
import {
  // @ts-ignore
  rollups,
  rollup, sum, mean, ascending,
} from 'd3-array';
import { TurnstileData, ProcessedStation } from './types';
import { FORMATTERS as F, appConfig, KEYS as K } from './constants';

export const getNameHash = (d: TurnstileData):string => `${d.station}—${d.line_name}`;

const calcDailyStationSummary = (data:TurnstileData[]) => rollups(data,
  (v) => ({
    entries_sum: sum(v, ({ entries_sum }) => entries_sum),
    morning_entries_sum: sum(v, ({ morning_entries_sum }) => morning_entries_sum),
    datetime: v[0] && v[0].datetime,
  }), ({ datetime }) => F.fDate(datetime));


/** Filters data for period before threshold and
 * creates a map from day of week to average stats */
const calcBenchmarkMap = (data) => rollup(
  data.filter(([, { datetime }]) => datetime < appConfig.thresholdDate),
  (v) => ({
    [K.ENTRIES_AVG]: mean(v, ([, { entries_sum }]) => entries_sum),
    [K.MORNING_AVG]: mean(v, ([, { morning_entries_sum }]) => morning_entries_sum),
  }),
  ([, { datetime }]) => F.fDay(datetime),
); // group by weekday


const calcPctDiffTimeline = (stationSummary, benchmarks) => stationSummary.map(([,
  { datetime, entries_sum, morning_entries_sum },
]) => {
  // for stations that only have data after threshold date
  if (!benchmarks.get(F.fDay(datetime))) return {};
  const { entries_avg, morning_avg } = benchmarks.get(F.fDay(datetime));
  return {
    date: F.fDate(datetime),
    entries: entries_sum,
    morning_entries: morning_entries_sum,
    [K.ENTRIES_PCT_CHG]: entries_avg > 0
      ? (entries_sum - entries_avg) / entries_avg
      : 0,
    [K.MORNING_PCT_CHG]: morning_avg > 0
      ? (morning_entries_sum - morning_avg) / morning_avg
      : 0,
  };
}).sort((a, b) => ascending(F.pDate(a.date), F.pDate(b.date)));

const getOverallStats = (v) => ({
  entries_avg: mean(v, ([, { entries_sum }]) => entries_sum),
  morning_avg: mean(v, ([, { morning_entries_sum }]) => morning_entries_sum),
});

export const processStations = (stationData: TurnstileData[],
  isOverall = false):ProcessedStation => {
  const summedByDay = calcDailyStationSummary(stationData);
  // calculate average for each weekday
  const benchmarks = calcBenchmarkMap(summedByDay);
  const pctDiff = calcPctDiffTimeline(summedByDay, benchmarks);
  const preStats = getOverallStats(summedByDay
    .filter(([, { datetime }]) => datetime < appConfig.thresholdDate));
  const postStats = getOverallStats(summedByDay
    .filter(([, { datetime }]) => datetime >= appConfig.thresholdDate));

  const summary = {
    [K.ENTRIES_PCT_CHG]: (postStats.entries_avg - preStats.entries_avg) / preStats.entries_avg,
    [K.MORNING_PCT_CHG]: (postStats.morning_avg - preStats.morning_avg) / preStats.morning_avg,
    entries_avg_pre: preStats.entries_avg,
    entries_avg_post: postStats.entries_avg,
    morning_avg_pre: preStats.morning_avg,
    morning_avg_post: postStats.morning_avg,
    entries_total: sum(summedByDay, ([, { entries_sum }]) => entries_sum),
    morning_total: sum(summedByDay, ([, { morning_entries_sum }]) => morning_entries_sum),
  };

  return {
    station: isOverall ? '' : getNameHash(stationData[0]),
    benchmarks,
    timeline: pctDiff,
    summary,
  };
};
