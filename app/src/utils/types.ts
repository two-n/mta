import { SECTIONS, VIEWS } from './constants';

export interface State {
  sectionData: AppDataType
  turnstileData: null | TurnstileData[],
  mapData: any,
  stationData: null | StationData[],
  acsData: null | ACSData,
  view: VIEWS,
}

export type AppDataType = {
  [key in SECTIONS]: SectionDataType
}

export type SectionDataType = {
  steps: StepDataType[],
  title: string
}

export type StepDataType = {
  step_id: number,
  header: string,
  text: string
}

export interface TurnstileData {
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
  swipes_avg_pre:number;
  swipes_avg_post:number;
}

export interface ProcessedStation {
  station: string;
  remote: string;
  timeline: StationTimelineItem[],
  summary: StationSummary
}

export interface Controller {
  [key:number]: {
    [key:string]: ()=> void
  }
}

export interface StationData {
  station_code: string;
  station: string;
  BoroCode: number;
  BoroName: number;
  NTACode: number;
  NTAName: number;
  GTFS_stop_id: string;
  line_name: string;
  ct2010: string;
  lat: number;
  long: number;
}

export interface ACSData{
  type: string;
  arcs: number[] [];
  bbox: number[];
  objects: {
    acs_nta:{
      type: string;
      geometries: {
        type: string;
        arcs: number[];
        properties: {
          [key:string]: string | number;
          NTACode: string;
          NTAName: string;
          BoroCode: number;
          BoroName: string;

        }
      }[]
    }
  }
}

export interface TimelineAnnotation{
  date: Date,
  step_id: number,
  label: string,
  duration: number,
}
