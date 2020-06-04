import { TurnstileData } from './types';

export const getNameHash = (d: TurnstileData):string => `${d.station} - ${d.line_name}`;

export default {};
