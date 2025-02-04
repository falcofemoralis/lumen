/* eslint-disable max-len */
/* eslint-disable new-cap */
import { customFetch } from 'Util/Fetch';
import vttToJson from 'vtt-to-json';

const { default: srtParser2 } = require('srt-parser-2');

export interface VTTItem {
  start: number
  end: number
  part: string
}

export interface SRTTem {
  startTime: string
  endTime: string
  text: string
}

export const subtitleParser = async (subitleUrl: string): Promise<VTTItem[]> => {
  const res = await customFetch(subitleUrl);
  const subtitleData = await res.text();

  const subtitleType = subitleUrl.split('.')[subitleUrl.split('.').length - 1];

  const result: VTTItem[] = [];

  if (subtitleType === 'srt') {
    const parser: {
      fromSrt: (data: any) => SRTTem[]
    } = new srtParser2();

    const parsedSubtitle: SRTTem[] = parser.fromSrt(subtitleData);

    parsedSubtitle.forEach(({ startTime, endTime, text }) => {
      result.push({
        start: timeToSeconds(startTime.split(',')[0]),
        end: timeToSeconds(endTime.split(',')[0]),
        part: text,
      });
    });
  }

  if (subtitleType === 'vtt') {
    const parsedSubtitle: VTTItem[] = await vttToJson(subtitleData);

    parsedSubtitle.forEach(({ start, end, part }) => {
      result.push({
        start: start / 1000,
        end: end / 1000,
        part,
      });
    });
  }

  return result;
};

export const storyboardParser = async (storyboardUrl: string): Promise<VTTItem[]> => {
  const res = await customFetch(storyboardUrl);
  const storyboardData = await res.text();

  const result: VTTItem[] = [];
  const parsedStoryboard: VTTItem[] = await vttToJson(storyboardData);

  parsedStoryboard.forEach(({ start, end, part }) => {
    result.push({
      start: start / 1000,
      end: end / 1000,
      part,
    });
  });

  return result;
};

export const timeToSeconds = (seconds: string): number => {
  const time: string[] = seconds.split(':');

  return time[0] && time[1] && time[2]
    ? +time[0] * 60 * 60 + +time[1] * 60 + +time[2]
    : 0;
};
