import { ScaleLinear } from 'd3';
import { StationData, AppDataType } from './types';

export const getNameHash = (d: StationData):string => `${d.station} - ${d.line_name}`;
export const getSectionHash = (sectionName: string, stepId: number) => `${sectionName}-${stepId}`;

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

export const calcSwarm = (
  stations: StationData[],
  xAcc: (d:StationData)=> number,
  x:ScaleLinear<number, number>,
  r:number,
) => {
  const radius2 = r ** 2;
  const circles = stations
    .map((d) => ({
      x: x(xAcc(d)),
      ...d,
    }))
    .sort((a, b) => a.x - b.x); // TODO: here is where we will sort by station
  const epsilon = 1e-3;
  let head:any = null;
  let tail = null;

  // Returns true if circle âŸ¨x,yâŸ© intersects with any circle in the queue.
  function intersects(x, y) {
    let a = head;
    while (a) {
      if (radius2 - epsilon > (a.x - x) ** 2 + (a.y - y) ** 2) {
        return true;
      }
      a = a.next;
    }
    return false;
  }

  // Place each circle sequentially.
  for (const b of circles) {
    // Remove circles from the queue that canâ€™t intersect the new circle b.
    while (head && head.x < b.x - radius2) head = head.next;

    // Choose the minimum non-intersecting tangent.
    if (intersects(b.x, (b.y = 0))) {
      let a = head;
      b.y = Infinity;
      do {
        const y = a.y + Math.sqrt(radius2 - (a.x - b.x) ** 2);
        if (y < b.y && !intersects(b.x, y)) b.y = y;
        a = a.next;
      } while (a);
    }

    // Add b to the queue.
    b.next = null;
    if (head === null) head = tail = b;
    else tail = tail.next = b;
  }

  return circles;
};

export default {};
