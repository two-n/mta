import { Store } from 'redux';
import {
  Selection, geoAlbersUsa, geoPath,
  scaleLinear, scaleBand,
  axisBottom, axisLeft, scaleOrdinal, select, ScaleLinear,
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
const duration = 200;
const geoPadding = {
  top: 50, bottom: 100, left: 30, right: 100,
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

    // SELECTORS
    this.mapOutline = S.getMapOutline(this.state);
    this.linesData = S.getLinesData(this.state);
    this.ntasData = S.getNTAFeatures(this.state);
    this.stationsGISData = S.getStationData(this.state);
    this.swipeData = S.getStationRollup(this.state);
    this.acsMap = S.getStationToACSMap(this.state);
    this.bboxes = S.getNTAbboxes(this.state);
    this.selectedNTAFeatures = S.getSelectedNTAS(this.state);

    this.getPctChange = this.getPctChange.bind(this);
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

    // Ref lines
    this.refLines
      .attr('class', `${C.ANNOTATION} x`)
      .append('path');

    this.refLines
      .append('g')
      .attr('class', `${C.ANNOTATION} y`)
      .append('path');

    // Ref labels
    this.overlay.append('div').attr('class', `${C.ANNOTATION}-${C.LABEL} x`)
      .html('% still riding');
    this.overlay.append('div').attr('class', `${C.ANNOTATION}-${C.LABEL} y`);

    this.handleResize();
  }

  draw() {
    const [width, height] = this.dims;
    this.geoPath = geoPath().projection(this.proj);
    this.el.attr('viewBox', `0 0 ${width} ${height}`);
    this.positionedStations = calcSwarm(this.stationsGISData,
      this.getPctChange, this.xScale, R * 2);

    this.setupGeographicElements();
    this.setupStations();
    this.setupAnnotations();
  }

  handleViewTransition() {
    const [width, height] = this.dims;
    const view = S.getView(this.state);
    const { extent: EW, average: AW } = S.getWeeklyDataExtent(this.state);
    this.xScale.domain(EW); // update for new data
    // VISIBILITY
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
          const yScale = this.yScales[this.yKey].scale; return `translate(
            ${this.xScale(this.getPctChange(d))}px,${yScale(this.getACS(d, this.yKey))}px)`;
        }
        default: {
          const [x, y] = this.proj([d.long, d.lat]);
          return `translate(${x}px, ${y}px)`;
        }
      }
    })
      .classed('allow-pointer', view >= V.SWARM);

    // SCALE VIEWBOX
    this.el
      .transition()
      .duration(1000)
      .attr('viewBox', () => { // [x, y, width, height]
        if (this.bboxes[view]) {
          const [xMin, yMin, xMax, yMax] = this.bboxes[view];
          const [x0, y0, x1, y1] = [...this.proj([xMin, yMax]), ...this.proj([xMax, yMin])]; // swith yMin/Max b/c browser coordinate system
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
      .on('mouseover', function () { select(this).raise(); });

    this.stations.selectAll('circle').data((d) => [d])
      .join('circle')
      .attr('r', R)
      .attr('vector-effect', 'non-scaling-stroke')
      .attr('fill', (d) => (this.colorScale(this.getPctChange(d))));

    this.stations.selectAll('text').data((d) => [d])
      .join('text')
      .attr('y', -R - 3)
      .text((d) => getNameHash(d));
  }

  setupAnnotations() {
    const [width, height] = this.dims;
    const { averages: A } = S.getDemoDataExtents(this.state);
    const { average: AW } = S.getWeeklyDataExtent(this.state);
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
    const [, height] = this.dims;
    const view = S.getView(this.state);
    const { averages: AD } = S.getDemoDataExtents(this.state);
    const { average: AW } = S.getWeeklyDataExtent(this.state);
    // AXES
    this.xAxisEl
      .transition()
      .duration(duration)
      .attr('transform', `translate(${0}, ${height - M.bottom})`)
      .call(this.xAxis);

    if (this.yScales[this.yKey]) {
      const {
        scale: yScale, format, label, median,
      } = this.yScales[this.yKey];
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

      // average lines and labesl
      this.refLines.select(`${C.ANNOTATION}.x`)
        .attr('transform', `translate(${this.xScale(AW)}, ${0})`);
      this.refLines.select(`${C.ANNOTATION}.y`)
        .attr('transform', `translate(0, ${this.yScale(AD[this.key])})`);
      this.overlay.select(`${C.ANNOTATION}-${C.LABEL}.x`)
        .attr('transform', `translate(${this.xScale(AW)}, ${0})`);
      this.overlay.select(`${C.ANNOTATION}-${C.LABEL}.y`)
        .attr('transform', `translate(0, ${this.yScale(AD[this.key])})`)
        .html(median);
    }

    // VISIBILITY
    this.parent.selectAll('.x')
      .classed(C.VISIBLE, view >= V.SWARM);
    this.parent.selectAll('.y')
      .classed(C.VISIBLE, !!this.yKey);
  }

  setView(view: V, key?: string) {
    this.store.dispatch(A.setView(view));
    this.yKey = key;
    this.handleViewTransition();
  }

  getPctChange(station: StationData) {
    const week = S.getSelectedWeek(this.state);
    return this.swipeData.get(station.unit)
      && this.swipeData.get(station.unit).timeline.get(week).swipes_pct_chg;
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
    this.handleResize();
  }

  get state() {
    return this.store.getState();
  }
}
