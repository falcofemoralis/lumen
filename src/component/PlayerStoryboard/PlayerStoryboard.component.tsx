import { Image } from 'expo-image';
import { memo, useEffect, useState } from 'react';
import { View } from 'react-native';
import { useAppTheme } from 'Theme/context';
import { storyboardParser, VTTItem } from 'Util/VttParser';

import { STORYBOARD_TILE_HEIGHT, STORYBOARD_TILE_WIDTH, STORYBOARD_TILES_COUNT } from './PlayerStoryboard.config';
import { PlayerStoryboardComponentProps } from './PlayerStoryboard.type';

interface StoryImageProps {
  uri: string;
  scale?: number;
}

// `#xywh=x,y,w,h` media fragment naming the tile inside the sprite sheet
const XYWH_REGEX = /xywh=(-?\d+),(-?\d+),(-?\d+),(-?\d+)/;

export const CacheImage = ({ uri }: { uri: string }) => (
  <Image
    style={ {
      width: '100%',
      height: '100%',
    } }
    source={ { uri } }
    // sheets are revisited constantly while scrubbing, so keep decoded bitmaps around
    cachePolicy="memory-disk"
  />
);

function imagePropsAreEqual(prevProps: StoryImageProps, props: StoryImageProps) {
  return prevProps.uri === props.uri;
}

const MemoizedCacheImage = memo(CacheImage, imagePropsAreEqual);

const StoryImageComponent = ({ uri, scale = 1 }: StoryImageProps) => {
  const { theme } = useAppTheme();

  if (!uri) {
    return null;
  }

  const split = uri.split('#');
  const baseUri = split[0];
  let offsetX = 0;
  let offsetY = 0;
  let width = STORYBOARD_TILE_WIDTH;
  let height = STORYBOARD_TILE_HEIGHT;

  // a regex rather than URLSearchParams: the RN polyfill builds a whole URL object per call,
  // which is far too expensive to run on every frame of a scrub
  const fragment = split.length > 1 ? XYWH_REGEX.exec(split[1]) : null;

  if (fragment) {
    offsetX = Number(fragment[1]) * scale;
    offsetY = Number(fragment[2]) * scale;
    width = Number(fragment[3]) * scale;
    height = Number(fragment[4]) * scale;
  }

  return (
    <View
      style={ {
        width,
        height,
        backgroundColor: theme.colors.background,
        overflow: 'hidden',
      } }
    >
      <View
        style={ {
          top: offsetY * -1,
          left: offsetX * -1,
          width: width * STORYBOARD_TILES_COUNT,
          height: height * STORYBOARD_TILES_COUNT,
        } }
      >
        <MemoizedCacheImage uri={ baseUri } />
      </View>
    </View>
  );
};

const StoryImage = memo(StoryImageComponent);

// cues are ordered by start time, so the covering one can be found without walking the list --
// which matters because a long video parses into thousands of them
function findCue(cues: VTTItem[], time: number): VTTItem | undefined {
  let low = 0;
  let high = cues.length - 1;

  while (low <= high) {
    const mid = (low + high) >> 1;
    const cue = cues[mid];

    if (!cue || time < cue.start) {
      high = mid - 1;
    } else if (time > cue.end) {
      low = mid + 1;
    } else {
      return cue;
    }
  }

  return undefined;
}

const PlayerStoryboardComponent = ({
  storyboardUrl,
  currentTime,
  style,
  scale,
}: PlayerStoryboardComponentProps) => {
  const [storyboard, setStoryboard] = useState<VTTItem[] | null>([]);
  const [img, setImg] = useState<string>('');
  const [syncedUrl, setSyncedUrl] = useState<string>(storyboardUrl);

  // a new storyboard invalidates both the parsed cues and the tile currently on screen
  const isUrlStale = syncedUrl !== storyboardUrl;

  if (isUrlStale) {
    setSyncedUrl(storyboardUrl);
    setStoryboard([]);
    setImg('');
  }

  useEffect(() => {
    let isCancelled = false;

    storyboardParser(storyboardUrl).then((parsedStoryboard) => {
      if (!isCancelled) {
        setStoryboard(parsedStoryboard);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [storyboardUrl]);

  // the tile is derived from the cues plus the playhead, so pick it during render and
  // keep the previous one whenever no cue covers the current time
  const item = isUrlStale || !storyboard
    ? undefined
    : findCue(storyboard, currentTime);

  if (item && item.part.trim() !== img) {
    setImg(item.part.trim());
  }

  return (
    <View style={ style }>
      <StoryImage
        uri={ img }
        scale={ scale }
      />
    </View>
  );
};

function storyboardPropsAreEqual(
  prevProps: PlayerStoryboardComponentProps,
  props: PlayerStoryboardComponentProps
) {
  return prevProps.storyboardUrl === props.storyboardUrl
    && prevProps.currentTime === props.currentTime;
}

export default memo(PlayerStoryboardComponent, storyboardPropsAreEqual);
