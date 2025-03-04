import { select, event, text } from 'd3';
import 'intersection-observer';
import { SectionDataType } from '../../utils/types';
import './style.scss';
import { getSectionHash } from '../../utils/helpers';
import { CLASSES as C, SECTIONS, KEYS } from '../../utils/constants';
import Socials from '../../components/Socials';

import video from '../../assets/subway.mp4';
import arrowPath from '../../assets/arrow.svg';

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

    this.byLine = this.el.append('div').attr('class', 'by-line')
      .html(`By
      <a href=${'https://www.aucherserr.com/'}>Aucher Serr</a>,
      <a href="http://two-n.com/">Two-N <span class="two-n"></span></a>`);

    this.socials = new Socials({ parent: this.el });

    this.arrow = this.el.append('div').attr('class', 'arrow')
      .on('click', this.scrollToFirstSection);
    text(arrowPath).then((icon) => this.arrow.html(icon));

    // create outside of app to take up full screen
    this.videoWrapper = select('body').append('div')
      .attr('class', 'title-video');

    this.video = this.videoWrapper.append('video')
      .attr('preload', 'auto')
      .attr('autoplay', true)
      .attr('muted', true)
      .attr('src', video); // chrome needs the source here

    this.video.append('source')
      .attr('type', 'video/mp4')
      .attr('src', video); // chrome needs the source here

    this.overlay = this.videoWrapper.append('div')
      .attr('class', 'overlay');

    this.videoWrapper.on('mousemove', () => {
      const { y } = event;
      this.overlay.style('transform', `translate(-25%, ${y - 10}px) translateY(-100%)`);
    });
  }

  scrollToFirstSection() {
    const el = select(`[${KEYS.DATA_STEP}=${getSectionHash(SECTIONS.S_INTRO, 0)}]`).node();
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
}
