import { Selection } from 'd3';
import './style.scss';

interface Props{
  parent: Selection;
}

const TEXT = 'MTA Ridership during COVID-19';
const URL = (source:string) => encodeURIComponent(`http://projects.two-n.com/mta?utm_source=${source}`);

export default class Socials {
  [x: string]: any;

  constructor({ parent }:Props) {
    this.parent = parent;
    this.el = this.parent
      .append('div');

    // SOCIALS
    this.socials = parent.append('div')
      .attr('class', 'socials');

    // TWITTER
    this.socials.append('a').attr('class', 'twitter')
      .attr('href', `https://twitter.com/intent/tweet?text=${TEXT}&url=${URL('twitter')}&via=${'2nfo'}&hashtags=${[
        'mta',
        'datavis',
        'COVID-19',
        'subway',
      ]}`);

    // FACEBOOK
    this.socials.append('a').attr('class', 'fb')
      .attr('href', `https://www.facebook.com/sharer/sharer.php?u=${URL('facebook')}`);

    this.socials.append('a').attr('class', 'linkedin')
      .attr('href', `https://www.linkedin.com/shareArticle?url=${URL('linkedin')}&title=${TEXT}`);
  }
}
