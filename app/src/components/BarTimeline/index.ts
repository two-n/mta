import { Store } from 'redux';
import {
  Selection, scaleLinear, max, scaleUtc, extent, bisector, select, interpolate,
} from 'd3';
import { ascending } from 'd3-array';
import * as S from '../../redux/selectors';
import { State, StationTimelineItem, StepDataType } from '../../utils/types';
import {
  CLASSES as C, FORMATTERS as F, DIRECTIONS as D, SECTIONS, KEYS, appConfig,
} from '../../utils/constants';
import './style.scss';
import styleVars from '../../styling/_variables.scss';

interface Props {
  parent: Selection;
  store: Store<State>
}

const M = {
  top: 30, bottom: 30, left: 30, right: 60,
};
const PAD = 10;
const DURATION = 500;
const DELAY = DURATION / 2;
const W_THRESH = 10;

// transition-stops -- step_ids
const TS = {
  DRAW_BOXES: 'drawBoxes',
  FADE_BARS: 'fadeOut',
  MOVE_REFS: 'moveTogether',
  GRADIENT: 'gradient',
};

export default class BarTimeline {
  [x: string]: any;

  steps: Map<number, {
    date: string,
    label: string,
    swipes: number,
    [key:string]: string | number | any[],
    data: StationTimelineItem[]
  }>

  constructor({ parent, store }: Props) {
    this.state = store.getState();
    this.parent = parent.classed(C.TIMELINE, true);
    this.el = this.parent.append('div');
    this.handleTransition = this.handleTransition.bind(this);
  }

  init() {
    const {
      timeline,
      summary: { swipes_avg_pre, swipes_avg_post, swipes_pct_chg },
    } = S.getOverallTimeline(this.state);
    this.section = S.getSectionData(this.state)[SECTIONS.S_TIMELINE];
    this.pctChg = swipes_pct_chg;
    this.c = S.getColorScheme(this.state);

    this.timeline = [...timeline].map(([, val]) => val)
      .sort((a, b) => ascending(F.pWeek(a.date), F.pWeek(b.date)))
      .filter((d) => F.pWeek(d.date) <= appConfig.endDate);

    this.getDateStopsMap();
    this.getAnimationStepIndex();

    // scales - range set in resize handler
    this.y = scaleLinear()
      .domain([0, max(this.timeline, ({ swipes }) => swipes as number)]);

    this.x = scaleUtc()
      .domain(extent(this.timeline, ({ date }) => F.pWeek(date)));

    // elements
    this.bars = this.el.append('div').attr('class', `${C.TIMELINE}-${C.WRAPPER}`)
      .selectAll(`div.${C.BAR}-${C.WRAPPER}`)
      .data(this.timeline)
      .join('div')
      .attr('class', `${C.BAR}-${C.WRAPPER}`);

    this.bars.selectAll(`div.${C.LABEL}`)
      .data((d) => [d])
      .join('div')
      .attr('class', C.LABEL);

    this.bars.selectAll(`div.${C.BAR}`)
      .data((d) => [d])
      .join('div')
      .attr('class', C.BAR);

    this.refBoxes = this.el.append('div').attr('class', C.REFERENCE).selectAll('div.box')
      .data([swipes_avg_pre, swipes_avg_post])
      .join('div')
      .attr('class', (d, i) => `box ${i === 0 ? 'pre' : 'post'}`);
  }

  draw() {
    const [width, height] = this.dims;
    this.barW = Math.max(((width - M.left - M.right) / this.timeline.length) * 0.7, 2);

    this.bars.select(`.${C.LABEL}`);

    this.bars.select(`.${C.BAR}`)
      .style('height', (d:StationTimelineItem) => `${this.y(d.swipes)}px`)
      .style('width', `${this.barW}px`);

    const threshold = this.timeline[this.bisect.left(this.timeline, appConfig.thresholdDate)];
    const middleBar = this.bars.filter((d) => d.date === threshold.date);
    const middleX = middleBar.node().offsetLeft + this.barW;

    this.refBoxes
      .style('height', (d) => `${this.y(d)}px`)
      .style('width', (d, i) => `${i === 0 ? middleX : width - middleX}px`)
      .style('left', (d, i) => (i === 1) && `${middleX}px`)
      .style('right', (d, i) => (i === 0) && `${width - middleX}px`);
  }

  handleTransition(element:any, index:number, direction: D) {
    const { tStopsMap } = this;
    const [width, height] = this.dims;
    const stepData = select(element).data()[0] as StepDataType;
    const isActive = (d) => (!!stepData.date
      || (!stepData.date && stepData.step_id < tStopsMap.get(TS.FADE_BARS)));

    this.bars.select(`.${C.LABEL}`)
      .classed(C.VISIBLE, isActive)
      .transition()
      .duration(DURATION)
      .delay((d, i) => (direction === D.DOWN ? i : 0) * DELAY)
      .tween('text', function (d) {
        if (isActive(d)) {
          // initialize tracker
          this._currentNum = this._currentNum || 0;
          const i = interpolate(this._currentNum, d.swipes);
          return function interp(t) {
            select(this).html(F.fSNum(this._currentNum = i(t)));
          };
        } this._currentNum = 0;
      });

    this.bars.select(`.${C.BAR}`)
      .classed(C.VISIBLE, isActive)
      .style('max-height', (d) => (isActive(d) ? this.y(d.swipes) : 0))
      .style('transition-duration', (d) => `${isActive(d)
        ? DURATION
        : DURATION * 2}ms`) // slower to fade down
      .style('transition-delay', (d, i) => `${((direction === D.DOWN && isActive(d)) ? i : 0) * DELAY}ms`)
      .classed(C.ACTIVE, (d) => this.steps.get(stepData.step_id)
      && (d.date === this.steps.get(stepData.step_id).date)); // need to get closest date

    this.refBoxes
      .classed(C.ACTIVE, stepData.step_id >= tStopsMap.get(TS.DRAW_BOXES))
      .style('transform', (d, i) => (stepData.step_id >= tStopsMap.get(TS.MOVE_REFS)
        ? `translate(${i === 0
          ? '50%'
          : '-50%'}, ${i === 0
          ? '-50%'
          : `${(height / 2 - (this.y(d) * 2))}px`})` : ''))
      .classed(C.GRADIENT, (d, i) => (stepData.step_id >= tStopsMap.get(TS.GRADIENT)
      && i === 0));
  }

  // finds the step index for each animation key
  getAnimationStepIndex() {
    // stop name => step_id
    this.tStopsMap = new Map(Object.values(TS).map((d) => ([
      d,
      this.section.steps.find((s) => s[KEYS.ANIMATION_KEY] === d).step_id]
    )));
  }

  getDateStopsMap() {
    this.bisect = bisector((d: StationTimelineItem) => F.pWeek(d.date));
    // pre-populate annotations
    this.steps = new Map(this.section.steps
      .filter((step) => step.date) // select all the steps that have dates in them
      .map((d) => { // find the closest data values (for y positionint)
        const closestIndex = this.bisect.left(this.timeline, F.pDate(d.date));
        return [d.step_id, {
          ...d,
          label: d.label,
          date: this.timeline[closestIndex].date, // matche it up with closest week
          swipes: this.timeline[closestIndex].swipes,
        }];
      }));
  }

  handleResize() {
    const { width, height } = this.parent.node().getBoundingClientRect();
    this.dims = [width, height];
    this.el.style('width', `${width}px`).style('height', `${height}px`);
    // update scales
    this.y.range([0, height - M.bottom - M.top]);
    this.x.range([M.left, width - M.right]);
    this.draw();
  }
}
