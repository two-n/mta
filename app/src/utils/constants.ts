import {
  format, utcFormat, utcParse, piecewise, interpolateRgb,
} from 'd3';

export enum SECTIONS {
  S_TITLE = 'section-title',
  S_INTRO = 'section-intro',
  S_TIMELINE = 'section-timeline',
  S_PCT_CHNG = 'section-pct-change',
  S_MOVING_MAP = 'section-map',
  S_METHODOLOGY ='section-methodology'
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
  MAP_WITH_CONTROLS, // return to map with control options
  METHODOLOGY
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
  REFERENCE = 'reference',
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
  COMMUTE = 'cw_pbtrnsP', // % commuting to work via public transportation (excluding taxicab)
  SERVICE_SECTOR = 'srvcP', // % population employed in service occupations
  POVERTY ='fambwpvP', // % families below poverty line

  ANIMATION_KEY = 'animation-key',
  DOT_POSITION = 'dot-position',
  Y_KEY = 'yKey',
  Y_DISPLAY = 'yDisplayName',
  Y_MEDIAN_LABEL = 'yMedianLabel',
  X_DISPLAY_NAME = 'xDisplayName',
  DATA_STEP = 'data-step'
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
  fMonthYr: utcFormat('%B %Y'),
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

export const METRIC_MAP: { [key: string]: {
  format: (d: number) => string,
  median: string,
  label: string,
  name: string,
}} = {
  [KEYS.NON_WHITE]: {
    format: FORMATTERS.fPctNoMult, median: 'Non-white', label: '% Non-white', name: 'Non-white',
  },
  [KEYS.INCOME_PC]: {
    format: FORMATTERS.sDollar, median: 'Per Capita Income', label: 'Per Capita Income ($)', name: 'Per Capita Income',
  },
  [KEYS.ED_HEALTH_PCT]: {
    format: FORMATTERS.fPctNoMult, median: 'Employed in sector', label: '% Employed in Education, Health Care and Social Assistance', name: 'Employed in Education, Health Care and Social Assistance',
  },
  [KEYS.UNINSURED]: {
    format: FORMATTERS.fPctNoMult, median: 'Without health insurance', label: '% Without health insurance', name: 'Without health insurance',
  },
  [KEYS.SNAP_PCT]: {
    format: FORMATTERS.fPctNoMult, median: 'Received SNAP benefits', label: '% Received SNAP benefits in last 12 months', name: 'Received SNAP benefits',
  },
  [KEYS.COMMUTE]: {
    format: FORMATTERS.fPctNoMult, median: '', label: '', name: 'Commuting to work via public transportation',
  },
  [KEYS.SERVICE_SECTOR]: {
    format: FORMATTERS.fPctNoMult, median: 'Employed in service sector', label: '% Employed in service sector', name: 'Employed in service sector',
  },
  [KEYS.POVERTY]: {
    format: FORMATTERS.fPctNoMult, median: 'Families below poverty line', label: '% Families below poverty line', name: 'Families below poverty line',
  },
};

const colorDomain = ['#3D696C', '#54B1B8', '#B87242', '#FFBD59'];
export const colorInterpolator = piecewise(interpolateRgb, colorDomain);

export const appConfig = {
  thresholdDate: new Date('2020-03-07'), // date for pre/post comparisions -- NYS state of emergency
  startDate: new Date('2020-01-01'), // date that we show data from for station timelines
  endDate: new Date('2020-06-08'), // end for pre/post comparisons, aligns with NYC Phase 1 reopening
  initialSelectedDate: new Date('2020-03-22'), // NYS on pause
};
