import { select, event } from 'd3';
import 'intersection-observer';
import { SectionDataType } from '../../utils/types';
import './style.scss';
import { CLASSES as C, SECTIONS } from '../../utils/constants';

import video from '../../assets/subway.mp4';

interface Props{
  data: SectionDataType;
}
/** Scaffolding for reusable section code */
export default class Title {
  [x: string]: any;

  data: SectionDataType;

  constructor({ data }: Props) {
    this.data = data;
    this.section = SECTIONS.S_TITLE;
    this.el = select('#app').append('section')
      .attr('id', `${this.section}`) /** unique to section */
      .attr('class', C.SECTION);

    this.el.append('h1').attr('class', C.TITLE).text(this.data.title);
    this.el.append('h3').attr('class', C.SUBTITLE).text(this.data.subtitle);

    this.video = this.el.append('video')
      .attr('class', 'title-video')
      .attr('autoplay', true);
    // .attr('loop', true);

    this.video.append('source')
      .attr('src', video);

    // speed up video a bit
    // this.video.node().playbackRate = 1.2;

    this.overlay = this.el.append('div')
      .attr('class', 'overlay');

    this.el.on('mousemove', () => {
      const { y } = event;
      this.overlay.style('transform', `translate(-25%, ${y - 10}px) translateY(-100%)`);
    });
  }
}
