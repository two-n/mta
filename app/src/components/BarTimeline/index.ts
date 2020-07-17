import { Store } from 'redux';
import {
  Selection, scaleLinear, max, scaleUtc, extent, bisector, select,
} from 'd3';
import * as S from '../../redux/selectors';
import { State, StationTimelineItem } from '../../utils/types';
import {
  CLASSES as C, FORMATTERS as F, DIRECTIONS as D, SECTIONS, KEYS,
} from '../../utils/constants';
import './style.scss';
import styleVars from '../../styling/_variables.scss';

interface Props {
  parent: Selection;
  store: Store<State>
}

const M = {
  top: 100, bottom: 30, left: 100, right: 100,
};
const PAD = 20;
const DELAY = 100;

// transition-stops -- step_ids
const TS = {
  FADE_BARS: 'fadeOut',
  MOVE_REFS: 'moveTogether',
  GRADIENT: 'gradient',
};

export default class BarTimeline {
  [x: string]: any;

  constructor({ parent, store }: Props) {
    this.store = store;
    this.parent = parent.classed(C.TIMELINE, true);
    this.el = this.parent.append('svg');
    this.overlay = this.parent.append('div').attr('class', C.OVERLAY);
    this.handleTransition = this.handleTransition.bind(this);
  }

  init() {
    const { timeline, summary: { swipes_avg_pre, swipes_avg_post, swipes_pct_chg } } = S.getOverallTimeline(this.store);
    this.c = S.getColorScheme(this.store);
    const bisect = bisector((d: StationTimelineItem) => F.pDate(d.date));

    // pre-populate annotations
    const section = S.getSectionData(this.store)[SECTIONS.S_TIMELINE];
    this.steps = new Map(section.steps
      .filter((step) => step.date) // select all the steps that have dates in them
      .map((d) => { // find the closest data values (for y positionint)
        const closestIndex = bisect.left(timeline, F.pDate(d.date));
        return [d.step_id, {
          ...d,
          date: timeline[closestIndex].date, // matche it up with closest week
          swipes: timeline[closestIndex].swipes,
        }];
      }));
    this.lastDateStep = max([...this.steps], ([, d]) => d.step_id);

    // stop name => step_id
    this.tStopsMap = new Map(Object.values(TS).map((d) => ([
      d,
      section.steps.find((s) => s[KEYS.ANIMATION_KEY] === d).step_id]
    )));

    // scales - range set in resize handler
    this.y = scaleLinear()
      .domain([0, max(timeline, ({ swipes }) => swipes)]);

    this.x = scaleUtc()
      .domain(extent(timeline, ({ date }) => F.pDate(date)));

    this.linesWrapper = this.el.append('g').attr('class', 'lines');

    // set up right/left reference bands - position in draw
    this.refLinesWrapper = this.el.append('g')
      .attr('class', 'ref-lines')
      .selectAll('g.ref')
      .data([swipes_avg_pre, swipes_avg_post])
      .join('g')
      .attr('class', 'ref');

    this.refLinesWrapper.append('path');
    this.refLinesWrapper.append('text')
      .attr('class', C.LABEL)
      .text((d) => F.fSNum(d))
      .attr('dy', '-.5em')
    ;

    // set up annotation labels - position in draw
    this.annotations = this.overlay.append('div').attr('class', C.ANNOTATIONS)
      .selectAll(`div.${C.ANNOTATION}`)
      .data([...this.steps].map(([, d]) => d))
      .join('div')
      .attr('class', C.ANNOTATION)
      .attr(C.DATA_STEP, (d) => d.step_id)
      .html((d) => d.label);

    this.gradient = this.el.selectAll(`g.${C.GRADIENT}`)
      .data([{ label: swipes_pct_chg, swipes: swipes_avg_post }])
      .join('g')
      .attr('class', C.GRADIENT);
    this.gradient.append('rect')
      .attr('fill', (d) => this.c(d.label));
    this.gradient.append('text').attr('class', C.LABEL)
      .text((d) => F.fPct(d.label)).attr('dx', '.5em');
  }

  draw() {
    const { timeline } = S.getOverallTimeline(this.store);

    console.log('this.y.domain(), this.y.range()', this.y.domain(), this.y.range(), this.y);
    const [width, height] = this.dims;
    this.barW = Math.max(((width - M.left - M.right) / timeline.length) - 20, 2);

    this.lines = this.linesWrapper.selectAll('rect')
      .data(timeline)
      .join('rect')
      .attr('width', this.barW)
      .attr('height', (d: StationTimelineItem) => this.y(d.swipes))
      .attr('opacity', 0)
      .attr(
        'transform',
        (d: StationTimelineItem) => `translate(${this.x(F.pDate(d.date))}, ${(height) / 2
            - this.y(d.swipes) / 2})`,
      );

    // position reference bands
    this.refLinesWrapper
      .style('transform', (d, i) => `translate(${this.x.range()[i]
    + (i === 0 ? -PAD - this.barW : PAD)}px, ${height / 2
      - (this.y(d) / 2)}px)`)
      .select('path')
      .attr('d', (d) => `M 0 ${0} H ${this.barW * 2} M ${this.barW} ${0} V ${this.y(d)} M 0 ${this.y(d)} H ${this.barW * 2}`);

    // position labels
    this.annotations
      .style('transform', (d) => `translate(${this.x(F.pDate(d.date))}px, ${height / 2
      - this.y(d.swipes) / 2}px) translateY(-100%)`);

    // position and size gradient
    const gradW = PAD * 2;
    this.gradient
      .style('transform', (d) => `translate(${width / 2 - (gradW / 2)}px, ${(height - M.bottom)
      - this.y(d.swipes)}px)`)
      .select('rect')
      .attr('width', gradW + this.barW)
      .attr('height', (d) => this.y(d.swipes));

    this.gradient.select('text')
      .attr('x', gradW + this.barW)
      .attr('y', (d) => this.y(d.swipes) / 2);
  }

  handleTransition(element:any, index:number, direction: D) {
    const { tStopsMap } = this;
    const [width, height] = this.dims;
    const data = select(element).data()[0];
    console.log('data.step-description', data);

    // either the date is earlier than the current step's date
    // or the steps are past the date step range
    const isActive = (d) => (data.date && F.pDate(d.date) <= F.pDate(this.steps.get(data.step_id).date))
      || data.step_id === this.lastDateStep + 1; // include bars after last date

    // callback for when bars finish transitioning
    const onTransitionDone = () => {
      this.annotations
        .classed(C.VISIBLE, (d) => d.step_id === data.step_id)
        .classed(C.FADED, (d) => d.step_id < data.step_id)
        .classed(C.HIDDEN, (d) => data.step_id >= tStopsMap.get(TS.FADE_BARS));

      this.lines.attr('opacity', (d) => (isActive(d) ? 1 : 0));
    };

    // TODO: fix animation logic for scrolling back up
    this.lines
      .transition()
      .duration((d) => (isActive(d) ? +styleVars.durationOpacity.slice(0, -2) : 0))
      .delay((d, i) => (isActive(d)
        ? (direction === D.DOWN ? i : this.steps.length - i) * DELAY // reverse delay on the way up
        : 0)) // only add delay to those transitioning in
      .attr('opacity', (d) => (isActive(d) ? 1 : 0))
      .end()
      .then(onTransitionDone)
      .catch(onTransitionDone);

    this.refLinesWrapper
      .style('transform', (d, i) => (
        (data.step_id < tStopsMap.get(TS.MOVE_REFS))
        // far apart
          ? `translate(${this.x.range()[i] + (i === 0 ? -PAD - this.barW : PAD)}px, ${
            (height) / 2 - this.y(d) / 2}px)`
          // close together
          : `translate(${width / 2 + (i === 0 ? -PAD - this.barW : PAD)}px, ${
            height - M.bottom - this.y(d)}px)`))
      .select('text').classed(C.VISIBLE, data.step_id >= tStopsMap.get(TS.MOVE_REFS));

    this.gradient.classed(C.VISIBLE, data.step_id >= tStopsMap.get(TS.GRADIENT));
  }


  handleResize() {
    const { width, height } = this.parent.node().getBoundingClientRect();
    this.dims = [width, height];
    this.el.attr('width', width).attr('height', height);
    this.overlay.style('width', `${width}px`).style('height', `${height}px`);
    // update scales
    this.y.range([0, height - M.bottom - M.top]);
    this.x.range([M.left, width - M.right]);
    this.draw();
  }
}
