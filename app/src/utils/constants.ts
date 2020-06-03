import { format } from 'd3-format';
import { timeFormat, timeParse } from 'd3-time-format';

export enum SECTIONS {
  S1 = 'section1',
  S2 = 'section2',
}

export enum DIRECTIONS {
  UP = 'up',
  DOWN = 'down'
}

export enum CLASSES {
  SECTION = 'section',
  SECTION_HEADER = 'section-header',
  ARTICLE = 'article',
  STEP = 'step',
  STEP_HEADER = 'step-header',
  STEP_TEXT = 'step-text',
  STICKY = 'sticky',
  GRAPHIC = 'graphic',
  TIMELINE='timeline',
  LINES = 'lines',
  LINE = 'line',
  AXIS = 'axis',
  CHART = 'chart',
  TITLE = 'title',
  FEVERLINE = 'feverline',
  FEVERGRID = 'fevergrid',
  BENCHMARK = 'benchmark',
  HIDDEN = 'hidden',
  VISIBLE = 'visible'
}

export enum KEYS {
  ENTRIES_AVG = 'entries_avg',
  ENTRIES_AVG_PRE = 'entries_avg_pre',
  ENTRIES_AVG_POST = 'entries_avg_post',
  ENTRIES_PCT_CHG = 'entries_pct_chg',
  ENTRIES_TOTAL = 'entries_total',

  MORNING_AVG = 'morning_avg',
  MORNING_AVG_PRE = 'morning_avg_pre',
  MORNING_AVG_POST = 'morning_avg_post',
  MORNING_PCT_CHG = 'morning_pct_chg',
  MORNING_TOTAL = 'morning_total',

  EXITS_AVG = 'exits_avg',
  EXITS_AVG_PRE = 'exits_avg_pre',
  EXITS_AVG_POST = 'exits_avg_post',
  EXITS_PCT_CHG = 'exits_pct_chg',
}

export const FORMATTERS = {
  fMonth: timeFormat('%B'),
  fMonthYr: timeFormat('%b-%Y'),
  fDay: timeFormat('%a'),
  fDate: timeFormat('%d-%m-%Y'),
  pDate: timeParse('%d-%m-%Y'),
  fNumber: format('.0s'),
  fPct: format('.0%'),
};

export const appConfig = {
  thresholdDate: new Date('2020-03-15'), // date for pre/post comparisions
  startDate: new Date('2020-03-01'), // date that we show data from for station timelines
};
