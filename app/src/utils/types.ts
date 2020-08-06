import { SECTIONS, VIEWS } from './constants';

export interface State {
  sectionData: AppDataType
  swipeData: null | SwipeData[],
  stationData: null | StationData[],
  mapData: null | MapData,
  location: string | null,
  view: VIEWS,
  yKey: null | string,
  selectedWeek: string,
  selectedLine: string, // line_name
  selectedNta: string, // ntaCode
}

export type AppDataType = {
  [key in SECTIONS]: SectionDataType
}

export type SectionDataType = {
  steps: StepDataType[],
  title: string
  subtitle?: string;
  datasources?: SectionDataType[]
}

export type StepDataType = {
  step_id: number,
  header: string,
  text: string,
  date: string,
  'dot-position': {
    [key: string]: string
  }
  [key: string]: string | number
}

export interface SwipeData {
  STATION: string;
  REMOTE: string;
  WEEK: Date;
  TOTAL: number;
}

export interface StationTimelineItem {
  date: string;
  swipes: number;
  swipes_pct_chg: number;
}

export interface StationSummary {
  swipes_pct_chg: number;
  swipes_avg_pre: number;
  swipes_avg_post: number;
}

export interface ProcessedStation {
  station: string;
  remote: string;
  timeline: Map<string, StationTimelineItem>,
  summary: StationSummary
}

export interface Controller {
  [key: number]: {
    [key: string]: () => void
  }
}

export interface StationData {
  station_code: string;
  unit: string; // Field to match stationss on
  station: string;
  BoroCode: number;
  BoroName: number;
  NTACode: string;
  NTAName: string;
  GTFS_stop_id: string;
  line_name: string;
  ct2010: string;
  lat: number;
  long: number;
}

export interface MapData {
  type: string;
  arcs: number[][];
  bbox: number[];
  objects: {
    acs_nta: TopoJSONObjectType;
    'mapOutline': TopoJSONObjectType;
    'subway-lines': TopoJSONObjectType;
  }
}

interface TopoJSONObjectType {
  type: string;
  geometries: {
    type: string;
    arcs: number[];
    properties: {
      [key: string]: string | number;
      NTACode: string;
      NTAName: string;
      BoroCode: number;
      BoroName: string;

    }
  }[]
}

export interface TimelineAnnotation {
  date: Date,
  step_id: number,
  label: string,
  duration: number,
}
