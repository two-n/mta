
import './style.scss';

const lineColor:{[line:string]: string} = {
  A: 'blue',
  C: 'blue',
  E: 'blue',
  B: 'orange',
  D: 'orange',
  F: 'orange',
  M: 'orange',
  G: 'lightGreen',
  J: 'brown',
  Z: 'brown',
  L: 'grey',
  N: 'yellow',
  Q: 'yellow',
  R: 'yellow',
  W: 'yellow',
  S: 'darkGrey',
  1: 'red',
  2: 'red',
  3: 'red',
  4: 'darkGreen',
  5: 'darkGreen',
  6: 'darkGreen',
  7: 'purple',
};


export const LineSwatch = (line:string) => `<span class="swatch ${lineColor[line]}">${line}</span>`;


export default LineSwatch;
