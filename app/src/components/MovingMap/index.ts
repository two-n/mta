import { Store } from 'redux';
import {
  Selection, geoAlbersUsa, geoPath,
  scaleLinear, scaleBand,
  axisBottom, axisLeft, scaleOrdinal, select, ScaleLinear, event,
} from 'd3';
import * as S from '../../redux/selectors/index';
import * as A from '../../redux/actions/creators';
import { State, StationData } from '../../utils/types';
import {
  CLASSES as C, VIEWS as V,
  KEYS as K, FORMATTERS as F, MTA_Colors, SECTIONS,
} from '../../utils/constants';
import { getNameHash, calcSwarm } from '../../utils/helpers';
import './style.scss';
import styleVars from '../../styling/_variables.scss';
import ColorLegend from '../ColorLegend';
import Tooltip from '../Tooltip';

interface Props {
  store: Store<State>
  parent: Selection
}

interface ScaleObject {
  scale: ScaleLinear<number, number>,
  format: (d: number) => string,
  label: string,
  median: string
}

const M = {
  top: 10, bottom: 150, left: 30, right: 20,
};
const R = 3;
const duration = +styleVars.durationMovement.slice(0, -2);
const geoPadding = {
  top: 50,
  bottom: +styleVars.controlBarHeight.slice(0, -2), // make room for control bar
  left: 30,
  right: 100,
};

const FORMAT_MAP: { [key: string]: (d: number) => string } = {
  [K.WHITE]: F.fPctNoMult,
  [K.INCOME_PC]: F.sDollar,
  [K.ED_HEALTH_PCT]: F.fPctNoMult,
  [K.UNINSURED]: F.fPctNoMult,
  [K.SNAP_PCT]: F.fPctNoMult,
};

const MAP_VISIBLE = [V.MAP_OUTLINE, V.MAP_DOTS_LINES, V.MAP_DOTS_LINES_NTAS];
export default class MovingMap {
  yScales: { [key: string]: ScaleObject }

  [x: string]: any;

  constructor({ store, parent }: Props) {
    this.store = store;
    this.parent = parent.classed(C.MOVING_MAP, true);
    this.el = parent.append('svg');

    this.state = this.store.getState();
    // SELECTORS
    this.mapOutline = S.getMapOutline(this.state);
    this.linesData = S.getLinesData(this.state);
    this.ntasData = S.getNTAFeatures(this.state);
    this.stationsGISData = S.getStationData(this.state);
    this.swipeData = S.getStationRollup(this.state);
    this.acsMap = S.getStationToACSMap(this.state);
    this.bboxes = S.getNTAbboxes(this.state);
    this.selectedNTAFeatures = S.getSelectedNTAS(this.state);
    this.view = S.getView(this.state);
    this.week = S.getSelectedWeek(this.state);

    this.getPctChange = this.getPctChange.bind(this);
    this.onStationMouseover = this.onStationMouseover.bind(this);
    this.onStationMouseout = this.onStationMouseout.bind(this);
    this.handleStateChange = this.handleStateChange.bind(this);
    this.store.subscribe(this.handleStateChange);
  }

  init() {
    const { extents: E } = S.getDemoDataExtents(this.state);
    const { extent: EW } = S.getWeeklyDataExtent(this.state);
    // keys for the yScales of the scatter plot segment
    const scatterKeys = S.getSectionData(this.state)[SECTIONS.S_MOVING_MAP]
      .steps
      .filter((d) => d[K.DOT_POSITION] && d[K.DOT_POSITION][K.Y_KEY])
      .map((d) => d[K.DOT_POSITION]);

    // SCALES
    this.proj = geoAlbersUsa();

    this.colorScale = S.getColorScheme(this.state);

    this.colorBoroughScale = scaleOrdinal().domain(E[K.BOROUGH] as string[]).range(MTA_Colors);

    this.boroYScale = scaleBand().domain(E[K.BOROUGH] as string[]);

    this.yScales = scatterKeys.reduce((obj: { [key: string]: ScaleObject }, d) => ({
      ...obj,
      [d[K.Y_KEY]]: {
        scale: scaleLinear().domain(E[d[K.Y_KEY]] as number[]),
        label: d[K.Y_DISPLAY],
        median: d[K.Y_MEDIAN_LABEL] || d[K.Y_DISPLAY],
        format: FORMAT_MAP[d[K.Y_KEY]],
      },
    }), {});

    this.xScale = scaleLinear()
      .domain(EW);
    this.xScale.tickFormat(null, F.sPct);

    // AXES
    this.xAxis = axisBottom(this.xScale).tickFormat(F.fPct);

    // ELEMENTS
    this.map = this.el.append('g').attr('class', C.MAP);
    this.ntas = this.el.append('g').attr('class', 'ntas');
    this.selectedNtas = this.el.append('g').attr('class', 'selected-ntas');
    this.lines = this.el.append('g').attr('class', C.LINES);
    this.stationsG = this.el.append('g').attr('class', C.STATIONS);
    this.xAxisEl = this.el.append('g').attr('class', `${C.AXIS} x`);
    this.yAxisEl = this.el.append('g').attr('class', `${C.AXIS} y`);
    this.refLines = this.el.append('g').attr('class', C.ANNOTATIONS);
    this.overlay = this.parent.append('div').attr('class', C.OVERLAY);
    this.legend = new ColorLegend({
      parent: this.overlay,
      title: '% Ridership',
      scale: this.colorScale,
      format: F.fPct,
    });
    this.tooltip = new Tooltip({ parent: this.overlay });

    // Ref lines
    this.refLines
      .append('g')
      .attr('class', `${C.ANNOTATION} x`)
      .append('path');

    this.refLines
      .append('g')
      .attr('class', `${C.ANNOTATION} y`)
      .append('path');

    // Ref labels
    this.overlay.append('div').attr('class', `${C.ANNOTATION}-${C.LABEL} x`);
    this.overlay.append('div').attr('class', `${C.ANNOTATION}-${C.LABEL} y`);

    this.handleResize();
  }

  draw() {
    const [width, height] = this.dims;
    this.geoPath = geoPath().projection(this.proj);
    this.el.attr('viewBox', `0 0 ${width} ${height}`);
    this.calcNodePositions();

    this.setupGeographicElements();
    this.setupStations();
    this.setupAnnotations();
  }

  handleViewTransition() {
    const [width, height] = this.dims;
    const { view, yKey, proj } = this;
    const { extent: EW } = S.getWeeklyDataExtent(this.state);
    this.xScale.domain(EW); // update for new data
    // VISIBILITY
    this.tooltip.makeInvisible();
    // map
    this.map
      .classed(C.VISIBLE, MAP_VISIBLE.includes(view));
    this.lines
      .classed(C.VISIBLE, view >= V.MAP_DOTS_LINES && view < V.SWARM);
    this.ntas
      .classed(C.VISIBLE, view >= V.MAP_DOTS_LINES_NTAS && view < V.SWARM);

    this.selectedNtas
      .classed(C.VISIBLE, view >= V.ZOOM_SOHO && view < V.SWARM);

    this.stationsG
      .classed(C.VISIBLE, view >= V.MAP_DOTS_LINES);

    // MOVE STATIONS
    this.stations.style('transform', (d: StationData) => {
      switch (view) {
        case (V.SWARM):
          return `translate(${d.x}px,${height - M.bottom - R - d.y}px)`; // x and y come from the `calcSwarm` function
        case (V.SCATTER): {
          const yScale = this.yScales[yKey].scale;
          return `translate(
            ${this.xScale(this.getPctChange(d))}px,${yScale(this.getACS(d, yKey))}px)`;
        }
        default: {
          const [x, y] = proj([d.long, d.lat]);
          return `translate(${x}px, ${y}px)`;
        }
      }
    })
      .attr('fill', (d) => (this.colorScale(this.getPctChange(d))))
      .classed('allow-pointer', view >= V.SWARM);
    // TODO: add visibility flag for line/neighborhood

    // SCALE VIEWBOX
    this.el
      .transition()
      .duration(1000)
      .attr('viewBox', () => { // [x, y, width, height]
        if (this.bboxes[view]) {
          const [xMin, yMin, xMax, yMax] = this.bboxes[view];
          const [x0, y0, x1, y1] = [
            ...proj([xMin, yMax]),
            ...proj([xMax, yMin])]; // swith yMin/Max b/c browser coordinate system
          return [
            x0 - geoPadding.left,
            y0 - geoPadding.top,
            (x1 - x0) + geoPadding.right,
            (y1 - y0) + geoPadding.bottom,
          ];
        }
        return [0, 0, width, height];
      }).on('end interrupt', () => {
        const matrix = this.el.node().getCTM();
        this.stations.selectAll('circle').style('transform', `scale(${1 / matrix.a})`);
      });

    this.transitionAnnotations();
  }

  setupGeographicElements() {
    // GEOGRAPHIC
    // map outline
    this.map
      .selectAll('path')
      .data(this.mapOutline.features)
      .join('path')
      .attr('vector-effect', 'non-scaling-stroke')
      .attr('d', this.geoPath);

    // neighborhood outlines
    this.ntas
      .selectAll('path')
      .data(this.ntasData.features)
      .join('path')
      .attr('vector-effect', 'non-scaling-stroke')
      .attr('d', this.geoPath);

    // selected neighborhood outlines
    this.selectedNtas
      .selectAll('path')
      .data(this.selectedNTAFeatures)
      .join('path')
      .attr('d', this.geoPath)
      .attr('fill', ({ properties }) => this.colorScale(properties[K.SWIPES_PCT_CHG]));

    // train lines
    this.lines
      .selectAll('path')
      .data(this.linesData.features)
      .join('path')
      .attr('d', this.geoPath)
      .attr('vector-effect', 'non-scaling-stroke');
  }

  setupStations() {
    this.stations = this.stationsG
      .selectAll(`g.${C.STATION}`)
      .data(this.positionedStations, (d) => d.station_code)
      .join('g')
      .attr('class', C.STATION)
      .on('mouseover', this.onStationMouseover)
      .on('mouseout', this.onStationMouseout);

    this.stations.selectAll('circle').data((d) => [d])
      .join('circle')
      .attr('r', R)
      .attr('vector-effect', 'non-scaling-stroke');
  }

  setupAnnotations() {
    const [width, height] = this.dims;
    this.overlay.selectAll(`div.${C.AXIS}-${C.LABEL}.x`)
      .data(['←', 'Higher percentage still riding→'])
      .join('div')
      .attr('class', `${C.AXIS}-${C.LABEL} ${C.NO_WRAP} x`)
      .style('left', (d, i) => i === 0 && `${M.left}px`)
      .style('right', (d, i) => i === 1 && `${M.right}px`)
      .style('transform', `translateY(${height - M.bottom}px)`)
      .html((d) => d);

    // Ref lines
    this.refLines.select(`g.${C.ANNOTATION}.y`)
      .select('path').attr('d', `M ${M.left} 0 H ${width - M.right}`);

    this.refLines.select(`g.${C.ANNOTATION}.x`).select('path')
      .attr('d', `M ${0} ${M.top} V ${height - M.bottom}`);
  }

  transitionAnnotations() {
    const {
      view, yKey, xAxis,
    } = this;
    const [width, height] = this.dims;
    const { averages: AD } = S.getDemoDataExtents(this.state);
    const { average: AW } = S.getWeeklyDataExtent(this.state);
    // AXES
    this.xAxisEl
      .transition()
      .duration(duration)
      .attr('transform', `translate(${0}, ${height - M.bottom})`)
      .call(xAxis);

    // handle all the scatter plots
    if (this.yScales[yKey]) {
      const {
        scale: yScale, format, label, median,
      } = this.yScales[yKey];
      this.yAxis = axisLeft(yScale).tickFormat(format);
      this.yAxisEl
        .transition()
        .duration(duration)
        .attr('transform', `translate(${M.left}, ${0})`)
        .call(this.yAxis);

      this.overlay.selectAll(`div.${C.AXIS}-${C.LABEL}.y`)
        .data([label])
        .join('div')
        .attr('class', `${C.AXIS}-${C.LABEL} y`)
        .style('top', `${M.top}px`)
        .style('transform', 'translateY(-100%)')
        .html((d) => d);

      // average lines and labels
      this.refLines.select(`.${C.ANNOTATION}.y`)
        .style('transform', `translate(0px, ${yScale(AD[this.yKey])}px)`);
      this.overlay.select(`.${C.ANNOTATION}-${C.LABEL}.y`)
        .style('transform', `translate(${width - M.right}px, ${yScale(AD[this.yKey])}px) translateX(-100%)`)
        .html(`${format(AD[this.yKey])} ${median}`);
    }

    // average lines and labels
    this.refLines.select(`.${C.ANNOTATION}.x`)
      .style('transform', `translate(${this.xScale(AW)}px, ${0}px)`);
    this.overlay.select(`.${C.ANNOTATION}-${C.LABEL}.x`)
      .style('transform', `translate(${this.xScale(AW)}px, ${0}px)`)
      .html(`average of ${F.fPct(AW)} still riding`);

    // VISIBILITY
    this.parent.selectAll('.x')
      .classed(C.VISIBLE, view >= V.SWARM);
    this.parent.selectAll('.y')
      .classed(C.VISIBLE, !!this.yKey);
  }

  setView(view: V, key?: string) {
    this.yKey = key;
    this.store.dispatch(A.setView(view));
  }

  getPctChange(station: StationData) {
    return this.swipeData.get(station.unit)
      && this.swipeData.get(station.unit).timeline.get(this.week)
      && this.swipeData.get(station.unit).timeline.get(this.week).swipes_pct_chg;
  }

  getACS(station: StationData, field: string) {
    return this.acsMap.get(station.NTACode)
      && this.acsMap.get(station.NTACode)[field] !== K.NA
      && this.acsMap.get(station.NTACode)[field];
  }

  handleResize() {
    const { width, height } = this.parent.node().getBoundingClientRect();
    this.dims = [width, height];
    this.el
      .attr('viewBox', [0, 0, width, height])
      .attr('width', width).attr('height', height);

    this.overlay.style('width', `${width}px`).style('height', `${height}px`);

    // update scales
    this.proj.fitSize([width, height], this.ntasData);
    this.xScale.range([M.left, width - M.right]);

    // update yScale ranges
    Object.values(this.yScales).forEach((d) => d.scale.range([height - M.bottom - R, M.top]));
    this.draw();
  }

  /** subscribe to state changes and update
   * view as needed
   */
  handleStateChange() {
    this.state = this.store.getState();
    this.view = S.getView(this.state);
    this.week = S.getSelectedWeek(this.state);
    // const newLine = S.getSelectedWeek(this.state);
    // const newNTA = S.getSelectedWeek(this.state);
    this.handleViewTransition();
    // if (this.view !== newView) {

    //   this.view = newView;
    //   this.handleViewTransition();
    // }

    // if (this.week !== newWeek
    // // || this.line ~== newLine
    // // || this.nta ~== newNta
    // ) {
    //   this.week = newWeek;
    //   /** NOTE: if want to see swarm change, need to uncomment next two lines
    //    *  issue with that is that
    //    * (a) it's a heavy calculation and
    //    * (b) the swarm doesn't look good when they are all concentrated in the same area
    //   */
    //   // this.calcNodePositions();
    //   // this.setupStations(); // remaps data to elements
    //   this.handleViewTransition();
    // }
  }

  onStationMouseover(d:StationData) {
    const { target, offsetX: x, offsetY: y } = event;
    select(target.parentNode).raise();
    this.tooltip.update([x, y], d.station);
  }

  onStationMouseout() {
    this.tooltip.makeInvisible();
  }

  calcNodePositions() {
    // recalculate swarm using new filter criteria
    this.positionedStations = calcSwarm(this.stationsGISData,
      this.getPctChange, this.xScale, R * 2);
  }

  // /** takes a timeline item and returns  */
  // get highlightCriteria(d:StationData) {
  //   (!this.line || d.line_name.includes(this.line))
  //   && (!this.ntaCode || d.NTACode == this.ntaCode);
  // }
}
