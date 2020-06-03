import { SECTIONS } from './constants';

export interface State {
  sectionData: AppDataType
  turnstileData: null | TurnstileData[]
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
  station_code: string;
  station: string;
  line_name: string;
  datetime: Date;
  entries_sum: number;
  entries_avg: number
  exits_sum: number
  exits_avg: number
  morning_entries_sum: number
  morning_entries_avg: number
}

export interface StationTimeline {
  date: string;
  entries: number;
  morning_entries: number;
  entries_pct_chg: number;
  morning_pct_chg: number;
}

export interface StationSummary {
  entries_pct_chg: number;
  morning_pct_chg: number;
  entries_avg_pre:number;
  morning_avg_pre:number;
  entries_avg_post:number;
  morning_avg_post:number;
  entries_total:number;
  morning_total:number;
}

export interface ProcessedStation {
  station: string;
  benchmarks: Map<string, {[key:string]: number}>
  timeline: StationTimeline,
  summary: StationSummary
}
