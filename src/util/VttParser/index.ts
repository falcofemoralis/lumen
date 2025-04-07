import webvtt from 'node-webvtt';
import { customFetch } from 'Util/Fetch';

export interface VTTItem {
  start: number
  end: number
  part: string
}

export interface ParsedVTTItem {
  identifier: string;
  start: number;
  end: number;
  text: string;
}

export interface ParsedVTTResult {
  cues: ParsedVTTItem[]
  valid: boolean
}

export const subtitleParser = async (subitleUrl: string): Promise<VTTItem[]> => {
  const res = await customFetch(subitleUrl);
  const subtitleData = await res.text();

  const subtitleType = subitleUrl.split('.')[subitleUrl.split('.').length - 1];

  const result: VTTItem[] = [];

  if (subtitleType === 'vtt') {
    const parsedSubtitle = webvtt.parse(subtitleData) as ParsedVTTResult;

    if (parsedSubtitle.valid) {
      parsedSubtitle.cues.forEach(({ start, end, text }) => {
        result.push({
          start,
          end,
          part: text,
        });
      });
    }
  }

  return result;
};

export const storyboardParser = async (storyboardUrl: string): Promise<VTTItem[]> => {
  const res = await customFetch(storyboardUrl);
  const storyboardData = await res.text();

  const result: VTTItem[] = [];
  const parsedStoryboard = webvtt.parse(storyboardData) as ParsedVTTResult;

  if (parsedStoryboard.valid) {
    parsedStoryboard.cues.forEach(({ start, end, text }) => {
      result.push({
        start,
        end,
        part: text,
      });
    });
  }

  return result;
};

export const timeToSeconds = (seconds: string): number => {
  const time: string[] = seconds.split(':');

  return time[0] && time[1] && time[2]
    ? +time[0] * 60 * 60 + +time[1] * 60 + +time[2]
    : 0;
};
