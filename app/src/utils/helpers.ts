import { TurnstileData } from './types';

export const getNameHash = (d: TurnstileData):string => `${d.station} - ${d.line_name}`;

export const getUnique = (data: any[],
  acc = (d:any) => d) => [...new Set(data.map(acc))];


export default {};
