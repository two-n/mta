import {
  format, utcFormat, utcParse, piecewise, interpolateRgb,
} from 'd3';

export enum SECTIONS {
  S_TITLE = 'section-title',
  S_INTRO = 'section-intro',
  S_TIMELINE = 'section-timeline',
  S_PCT_CHNG = 'section-pct-change',
  S_MOVING_MAP = 'section-map',
}

export enum DIRECTIONS {
  UP = 'up',
  DOWN = 'down'
}

export enum VIEWS {
  BLANK,
  MAP_OUTLINE,
  MAP_DOTS_LINES,
  MAP_DOTS_LINES_NTAS,
  ZOOM_SOHO,
  ZOOM_BROWNSVILLE,
  SWARM,
  SCATTER,
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
  TIMELINE = 'timeline',
  LINES = 'lines',
  LINE = 'line',
  AXIS = 'axis',
  CHART = 'chart',
  TITLE = 'title',
  SUBTITLE = 'subtitle',
  MOVING_MAP = 'moving-map',
  MAP = 'map',
  BENCHMARK = 'benchmark',
  HIDDEN = 'hidden',
  VISIBLE = 'visible',
  FADED = 'faded',
  ACTIVE = 'active',
  STATIONS = 'stations',
  STATION = 'station',
  ANNOTATIONS = 'annotations',
  ANNOTATION = 'annotation',
  DATA_STEP = 'data-step',
  LABEL = 'label',
  OVERLAY = 'overlay',
  NO_WRAP = 'no-wrap',
  FADE_IN = 'fade-in',
  FADE_OUT = 'fade-out',
  GRADIENT = 'gradient',
  WRAPPER = 'wrapper',
  BAR = 'bar',
  REFERENCE='reference',
  HIGHLIGHT = 'highlight',
}

export enum KEYS {
  SWIPES = 'swipes',
  SWIPES_PCT_CHG = 'swipes_pct_chg',
  SUMMARY_SWIPES_PCT_CHG = 'summary_swipes_pct_chg',
  SUMMARY_SWIPES_AVG_POST = 'summary_swipes_avg_post',

  NA = '-',
  BOROUGH = 'BoroCode',
  NTA_CODE = 'NTACode',
  INCOME_PC = 'percapincE', // "Per Capita Income ($)"
  SNAP_PCT = 'inc_snapP', // "Percent With Food Stamp/SNAP benefits in the past 12 months (%)"
  ED_HEALTH_PCT = 'edhlthcsaP', // Percent Employed in Educational Services, and Health Care and Social Assistance (%)"
  UNINSURED = 'nhinsP', // "Percent with No Health Insurance Coverage (%)"
  WHITE = 'wtnhP', // "Percent with No Health Insurance Coverage (%)"
  NON_WHITE='pct_nonwhite', // inverse of pct white

  ANIMATION_KEY = 'animation-key',
  DOT_POSITION = 'dot-position',
  Y_KEY = 'yKey',
  Y_DISPLAY = 'yDisplayName',
  Y_MEDIAN_LABEL = 'yMedianLabel',
  X_DISPLAY_NAME = 'xDisplayName'
}

export const boroughMap: { [key: number]: string } = {
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
  fMonth: utcFormat('%b'),
  fDayMonth: utcFormat('%b-%d'),
  fMonthYr: utcFormat('%b-%Y'),
  fDay: utcFormat('%a'),
  fDate: utcFormat('%d-%m-%Y'),
  pDate: utcParse('%d-%m-%Y'),
  fWeek: utcFormat('%W-%Y'),
  pWeek: utcParse('%W-%Y'),
  fNumber: format('.2s'),
  fSNum: format('.0s'),
  fPct: format('.0%'),
  fPctNoMult: (d: number) => `${format('.0f')(d)}%`,
  fBorough: (d: number) => boroughMap[d],
  sDollar: format('$,.0s'),
  sNumber: '.0s',
  sPct: '.0%',
};

const colorDomain = ['#3D696C', '#54B1B8', '#B87242', '#FFBD59'];
export const colorInterpolator = piecewise(interpolateRgb, colorDomain);

export const appConfig = {
  thresholdDate: new Date('2020-03-22'), // date for pre/post comparisions
  startDate: new Date('2020-01-01'), // date that we show data from for station timelines
  endDate: new Date('2020-06-08'), // end for pre/post comparisons, aligns with NYC Phase 1 reopening
};
