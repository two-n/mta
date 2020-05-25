import { SECTIONS } from "./constants";

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