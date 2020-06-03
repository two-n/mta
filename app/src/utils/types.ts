import { SECTIONS } from "./constants";

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
  datetime: string;
  entries_sum: number;
  entries_avg: number
  exits_sum: number
  exits_avg: number
  morning_entries_sum: number
  morning_entries_avg: number
}