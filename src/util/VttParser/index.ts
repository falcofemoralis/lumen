import { REZKA_PROXY_PROVIDER } from 'Api/RezkaApi/configApi';
import webvtt from 'node-webvtt';
import { Platform } from 'react-native';
import { customFetch } from 'Util/Fetch';
import { setProxyHeaders } from 'Util/Request';
import { updateUrlHost } from 'Util/Url';

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

export const vttLoader = async (url: string) => {
  const isWeb = Platform.OS === 'web';
  const input = isWeb ? updateUrlHost(url, REZKA_PROXY_PROVIDER) : url;
  const headers = isWeb ? setProxyHeaders({}, (new URL(url).origin)) : undefined;

  const res = await customFetch(input, headers ? { headers } : undefined);

  return res.text();
};

export const subtitleParser = async (subitleUrl: string): Promise<VTTItem[]> => {
  const subtitleData = await vttLoader(subitleUrl);
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
  const storyboardData = await vttLoader(storyboardUrl);
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
