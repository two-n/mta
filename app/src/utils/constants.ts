import { format } from 'd3-format';
import { timeFormat, timeParse } from 'd3-time-format';

export enum SECTIONS {
  S_TIMELINE = 'section-timeline',
  S_PCT_CHNG = 'section-pct-change',
  S_MOVING_MAP = 'section-moving-map',
}

export enum DIRECTIONS {
  UP = 'up',
  DOWN = 'down'
}

export enum VIEWS {
  MAP,
  PCT_CHANGE,
  BOROUGH,
  PCT_CHANGE_BOROUGH,
  SCATTER_PCT_INCOME,
  SCATTER_ED_HEALTH,
  SCATTER_UNINSURED,
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
  MOVING_MAP = 'moving-map',
  MAP = 'map',
  BENCHMARK = 'benchmark',
  HIDDEN = 'hidden',
  VISIBLE = 'visible',
  ACTIVE = 'active',
  STATIONS ='stations',
  STATION ='station',
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

  NA='-',
  BOROUGH= 'boro_code',
  INCOME_PC = 'DP03_0088E', // "Per Capita Income ($)"
  SNAP_PCT = 'DP03_0074PE', // "Percent With Food Stamp/SNAP benefits in the past 12 months (%)"
  ED_HEALTH_PCT = 'DP03_0042PE', // Percent Employed in Educational Services, and Health Care and Social Assistance (%)"
  UNINSURED='DP03_0099PE', // "Percent with No Health Insurance Coverage (%)"
}

export const FORMATTERS = {
  fMonth: timeFormat('%B'),
  fMonthYr: timeFormat('%b-%Y'),
  fDay: timeFormat('%a'),
  fDate: timeFormat('%d-%m-%Y'),
  pDate: timeParse('%d-%m-%Y'),
  fNumber: format('.0s'),
  fPct: format('.0%'),
  sDollar: '$,.0s',
  sNumber: '.0s',
  sPct: '.0%',
};

export const appConfig = {
  thresholdDate: new Date('2020-03-15'), // date for pre/post comparisions
  startDate: new Date('2020-03-01'), // date that we show data from for station timelines
};
