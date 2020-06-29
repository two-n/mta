import {
  format, utcFormat, utcParse,
} from 'd3';

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
  FADED = 'faded',
  ACTIVE = 'active',
  STATIONS ='stations',
  STATION ='station',
  ANNOTATIONS = 'annotations',
  ANNOTATION = 'annotation',
  DATA_STEP = 'data-step',
  LABEL = 'label',
  OVERLAY = 'overlay',
  NO_WRAP = 'no-wrap',
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
  BOROUGH= 'BoroCode',
  NTA_CODE= 'NTACode',
  INCOME_PC = 'percapincE', // "Per Capita Income ($)"
  SNAP_PCT = 'inc_snapE', // "Percent With Food Stamp/SNAP benefits in the past 12 months (%)"
  ED_HEALTH_PCT = 'edhlthcsaP', // Percent Employed in Educational Services, and Health Care and Social Assistance (%)"
  UNINSURED='nhinsP', // "Percent with No Health Insurance Coverage (%)"
}

export const boroughMap: {[key:number]: string} = {
  1: 'Manhattan',
  2: 'Bronx',
  3: 'Brooklyn',
  4: 'Queens',
  5: 'Staten Island',
};

export const MTA_Colors = [
  '#0039A6', // dark blue
  '#FF6319', // orange
  '#00933C', // green
  '#B933AD', // purple
  '#EE352E', // red
];

export const FORMATTERS = {
  fMonth: utcFormat('%B'),
  fMonthYr: utcFormat('%b-%Y'),
  fDay: utcFormat('%a'),
  fDate: utcFormat('%d-%m-%Y'),
  pDate: utcParse('%d-%m-%Y'),
  fNumber: format('.2s'),
  fPct: format('.0%'),
  fPctNoMult: (d:number) => `${format('.0f')(d)}%`,
  fBorough: (d:number) => boroughMap[d],
  sDollar: format('$,.0s'),
  sNumber: '.0s',
  sPct: '.0%',
};

export const appConfig = {
  thresholdDate: new Date('2020-03-15'), // date for pre/post comparisions
  startDate: new Date('2020-01-01'), // date that we show data from for station timelines
};
