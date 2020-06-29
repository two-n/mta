
import {
  //@ts-ignore
  rollups,
 mean, ascending,sum,
} from 'd3-array';
import { TurnstileData, ProcessedStation, StationSummary } from './types';
import { FORMATTERS as F, appConfig} from './constants';

export const processStations = (data: TurnstileData[],
  isOverall = false):ProcessedStation => {

  // rollup total swipes by week
  type weeklySum = {WEEK: Date, TOTAL: number}
  const sumByWeek:weeklySum[]  = rollups(data,
    (v:TurnstileData[])=> ({
      WEEK: v[0] && v[0].WEEK,
      TOTAL: sum(v, ({TOTAL})=> TOTAL),
    }),
    (({WEEK}: TurnstileData)=> F.fDate(WEEK))
  ).map(([,sums]: [string, {WEEK: Date, TOTAL: number}])=> sums)

  // calculate average for each weekday
  const preSwipes = mean(sumByWeek
    .filter(({ WEEK }:weeklySum) => WEEK < appConfig.thresholdDate)
    ,({ TOTAL }) => TOTAL );
  const postSwipes = mean(sumByWeek
    .filter(({ WEEK }:weeklySum) => WEEK >= appConfig.thresholdDate)
    ,({ TOTAL }) => TOTAL );

  const summary: StationSummary = {
    swipes_pct_chg: (postSwipes -preSwipes)/ preSwipes,
    swipes_avg_post: postSwipes,
    swipes_avg_pre: preSwipes
  };

  return {
    station: isOverall ? '' : data[0].STATION,
    remote: isOverall ? '' : data[0].REMOTE,
    timeline: sumByWeek.map((
      { WEEK, TOTAL}) =>  ({
        date: F.fDate(WEEK),
        swipes: TOTAL,
        swipes_pct_chg: (TOTAL - preSwipes)/preSwipes,
      })
    ).sort((a, b) => ascending(F.pDate(a.date), F.pDate(b.date))),
    summary,
  };
};

export default {};
