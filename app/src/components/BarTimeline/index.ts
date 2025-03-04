import { Store } from 'redux';
import {
  Selection, scaleLinear, max, scaleUtc, extent, bisector, select, interpolate, event,
} from 'd3';
import * as S from '../../redux/selectors';
import { State, StationTimelineItem, StepDataType } from '../../utils/types';
import {
  CLASSES as C, FORMATTERS as F, DIRECTIONS as D, SECTIONS, KEYS, appConfig,
} from '../../utils/constants';
import './style.scss';
import Tooltip from '../Tooltip';

interface Props {
  parent: Selection;
  store: Store<State>
}

const M = {
  top: 30, bottom: 50, left: 30, right: 60,
};
const DURATION = 200;
const DELAY = DURATION / 2;

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
    this.el = this.parent;
    this.handleTransition = this.handleTransition.bind(this);
    this.onBarMouseover = this.onBarMouseover.bind(this);
    this.onBarMouseout = this.onBarMouseout.bind(this);
  }

  init() {
    const {
      timeline,
      summary: { swipes_avg_pre, swipes_avg_post, swipes_pct_chg },
    } = S.getOverallTimeline(this.state);
    this.avgSwipesPre = swipes_avg_pre; // to use in transition
    this.section = S.getSectionData(this.state)[SECTIONS.S_TIMELINE];
    this.pctChg = swipes_pct_chg;
    this.c = S.getColorScheme(this.state);

    this.timeline = timeline
      .filter((d) => F.pWeek(d.date) <= appConfig.endDate);

    this.getDateStopsMap();
    this.getAnimationStepIndex();

    // scales - range set in resize handler
    this.y = scaleLinear()
      .domain([0, max(this.timeline, ({ swipes }) => swipes as number)]);

    this.x = scaleUtc()
      .domain(extent(this.timeline, ({ date }) => F.pWeek(date)));

    // elements
    this.timelineWrapper = this.el.append('div').attr('class', `${C.TIMELINE}-${C.WRAPPER}`);
    this.bars = this.timelineWrapper
      .selectAll(`div.${C.BAR}-${C.WRAPPER}`)
      .data(this.timeline)
      .join('div')
      .attr('class', `${C.BAR}-${C.WRAPPER}`)
      .on('mouseover', this.onBarMouseover)
      .on('mouseout', this.onBarMouseout);

    this.bars.selectAll(`div.${C.LABEL}`)
      .data((d) => [d])
      .join('div')
      .attr('class', C.LABEL);

    this.bars.selectAll(`div.${C.BAR}`)
      .data((d) => [d])
      .join('div')
      .attr('class', C.BAR);

    this.datesWrapper = this.el.append('div').attr('class', 'dates');
    this.datesWrapper.selectAll('div.date')
      .data([appConfig.startDate, appConfig.endDate])
      .join('div')
      .attr('class', 'date')
      .html((d) => F.fMonthYr(d));
    this.datesWrapper.append('div').attr('class', C.TITLE)
      .html('Change in ridership in million riders week over week - January 1 to June 8, 2020');

    this.refBoxes = this.el.append('div').attr('class', C.REFERENCE).selectAll('div.box')
      .data([swipes_avg_pre, swipes_avg_post])
      .join('div')
      .attr('class', (d, i) => `box ${i === 0 ? 'pre' : 'post'}`)
      .attr('data-pct', F.fPct(swipes_pct_chg))
      .attr('data-swipes', (d) => F.fSNum(d));

    this.tooltip = new Tooltip({ parent: this.el });
  }

  draw() {
    const [width] = this.dims;
    this.barW = Math.max(((width - M.left - M.right) / this.timeline.length) * 0.7, 2);

    this.bars.select(`.${C.LABEL}`);

    this.bars.select(`.${C.BAR}`)
      .style('height', (d:StationTimelineItem) => `${this.y(d.swipes)}px`)
      .style('width', `${this.barW}px`);

    const threshold = this.timeline[this.bisect.left(this.timeline, appConfig.thresholdDate)];
    const middleBar = this.bars.filter((d) => d.date === threshold.date);
    this.refBorderWidth = 2.5;
    this.middleX = middleBar.node().offsetLeft + this.barW + this.refBorderWidth;

    this.refBoxes
      .style('height', (d) => `${this.y(d)}px`)
      .style('width', (d, i) => `${i === 0 ? this.middleX : width - this.middleX}px`)
      .style('left', (d, i) => (i === 1) && `${this.middleX - this.refBorderWidth}px`)
      .style('right', (d, i) => (i === 0) && `${(width - this.middleX)}px`);
  }

  handleTransition(element:any, index:number, direction: D) {
    const { tStopsMap } = this;
    const [width, height] = this.dims;
    const stepData = select(element).data()[0] as StepDataType;
    const isBarVisible = (d) => (stepData.date || (!stepData.date && stepData.step_id < tStopsMap.get(TS.FADE_BARS)));

    const isTimlineVisible = stepData.step_id < tStopsMap.get(TS.MOVE_REFS);

    this.bars.select(`.${C.LABEL}`)
      .classed(C.VISIBLE, (d) => isBarVisible(d) && this.availableDates.includes(d.date))
      .transition()
      .duration(DURATION * 7)
      .delay((d, i) => (direction === D.DOWN ? i : 0) * DELAY)
      .tween('text', function (d) {
        if (isBarVisible(d)) {
          // initialize tracker
          this._currentNum = this._currentNum || 0;
          const i = interpolate(this._currentNum, d.swipes);
          return function interp(t) {
            select(this).html(F.fNumber(this._currentNum = i(t)));
          };
        } this._currentNum = 0;
      });

    this.bars.select(`.${C.BAR}`)
      .classed(C.VISIBLE, isBarVisible)
      .style('max-height', (d) => (isBarVisible(d) ? this.y(d.swipes) : 0))
      .style('transition-duration', (d) => `${isBarVisible(d)
        ? DURATION
        : DURATION * 2}ms`) // slower to fade down
      .style('transition-delay', (d, i) => `${((direction === D.DOWN && isBarVisible(d)) ? i : 0) * DELAY}ms`)
      .classed(C.ACTIVE, (d) => this.steps.get(stepData.step_id)
      && (d.date === this.steps.get(stepData.step_id).date)); // need to get closest date

    this.timelineWrapper.classed(C.VISIBLE, isTimlineVisible);
    this.datesWrapper.classed(C.VISIBLE, isTimlineVisible);

    this.refBoxes
      .classed(C.ACTIVE, stepData.step_id >= tStopsMap.get(TS.DRAW_BOXES))
      .classed(`${C.ACTIVE}-${C.LABEL}`, stepData.step_id >= tStopsMap.get(TS.FADE_BARS))
      .style('transform', (d, i) => {
        if (stepData.step_id >= tStopsMap.get(TS.MOVE_REFS)) {
          return (i === 0)
            ? 'translate(50%, -50%)'
            : `translate(-50%, ${((this.y(this.avgSwipesPre)) / 2 - (this.y(d)))}px)`;
        } return '';
      })
      .classed(C.GRADIENT, (d, i) => (stepData.step_id >= tStopsMap.get(TS.GRADIENT)))
      .classed('center', (d, i) => (stepData.step_id >= tStopsMap.get(TS.MOVE_REFS)))
      .style('width', (d, i) => {
        if (i === 0) return `${this.middleX}px`;
        return stepData.step_id >= tStopsMap.get(TS.MOVE_REFS)
          ? `${this.middleX}px`
          : `${width - this.middleX + this.refBorderWidth}px`;
      });
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
        const closestIndex = this.bisect.left(this.timeline, F.pWeek(F.fWeek(F.pDate(d.date))));
        return [d.step_id, {
          ...d,
          label: d.label,
          date: this.timeline[closestIndex] && this.timeline[closestIndex].date, // matche it up with closest week
          swipes: this.timeline[closestIndex] && this.timeline[closestIndex].swipes,
        }];
      }));

    // get list of all dates to highlight
    this.availableDates = [...this.steps].map(([, { date }]) => date);
  }

  handleResize() {
    const { width, height } = this.parent.node().getBoundingClientRect();
    this.dims = [width, height];
    // update scales
    this.y.range([0, height - M.bottom - M.top]);
    this.x.range([M.left, width - M.right]);
    this.draw();
  }

  onBarMouseover(d:StationTimelineItem) {
    const [width, height] = this.dims;
    const { left, top } = this.el.node().getBoundingClientRect();
    const { clientX: x, clientY: y } = event;
    const content = `<div class="date">Week of ${F.fDayMonth(F.pWeek(d.date))}</div>
    <div class="stat">Ridership: ${F.fNumber(d.swipes)}</div>`;
    this.tooltip.update([x - left, y - top], content, y > height * 0.2, x > width * 0.7);
  }

  onBarMouseout() {
    this.tooltip.makeInvisible();
  }
}
