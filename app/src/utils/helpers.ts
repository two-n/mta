import { StationData, AppDataType } from './types';

export const getNameHash = (d: StationData):string => `${d.station} - ${d.line_name}`;

export const getUnique = (data: any[],
  acc = (d:any) => d) => [...new Set(data.map(acc))];

export const addStepIds = (sectionData:
  AppDataType) => Object.entries(sectionData)
  .reduce((obj, [key, val]) => ({
    ...obj,
    [key]: {
      ...val,
      ...val.steps
        ? {
          steps: val.steps.map((d, i) => ({
            ...d,
            step_id: i, // this is all we're doing here
          })),
        }
        : {},
    },
  }), {});


export default {};
