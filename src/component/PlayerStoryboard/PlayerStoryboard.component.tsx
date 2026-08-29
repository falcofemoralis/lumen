import { useConfigContext, useIsTV } from 'Context/ConfigContext';
import { Image } from 'expo-image';
import { memo, useEffect, useState } from 'react';
import { View } from 'react-native';
import { useAppTheme } from 'Theme/context';
import { storyboardParser, VTTItem } from 'Util/VttParser';

import {
  NO_CUE,
  STORYBOARD_SIDE_SCALE,
  STORYBOARD_SIDE_TILES_MOBILE,
  STORYBOARD_SIDE_TILES_TV,
  STORYBOARD_TILE_GAP,
  STORYBOARD_TILE_HEIGHT,
  STORYBOARD_TILE_WIDTH,
  STORYBOARD_TILES_COUNT,
} from './PlayerStoryboard.config';
import { PlayerStoryboardComponentProps } from './PlayerStoryboard.type';

interface StoryImageProps {
  uri: string;
  scale?: number;
}

interface StorySideImageProps extends StoryImageProps {
  width: number;
  height: number;
}

interface TileRect {
  baseUri: string;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
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

// a regex rather than URLSearchParams: the RN polyfill builds a whole URL object per call,
// which is far too expensive to run on every frame of a scrub
function parseTile(uri: string, scale: number): TileRect {
  const split = uri.split('#');
  const fragment = split.length > 1 ? XYWH_REGEX.exec(split[1]) : null;

  if (!fragment) {
    return {
      baseUri: split[0],
      offsetX: 0,
      offsetY: 0,
      width: STORYBOARD_TILE_WIDTH,
      height: STORYBOARD_TILE_HEIGHT,
    };
  }

  return {
    baseUri: split[0],
    offsetX: Number(fragment[1]) * scale,
    offsetY: Number(fragment[2]) * scale,
    width: Number(fragment[3]) * scale,
    height: Number(fragment[4]) * scale,
  };
}

const StoryImageComponent = ({ uri, scale = 1 }: StoryImageProps) => {
  const { theme } = useAppTheme();

  if (!uri) {
    return null;
  }

  const {
    baseUri,
    offsetX,
    offsetY,
    width,
    height,
  } = parseTile(uri, scale);

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

/**
 * An adjacent tile. The slot is sized from the current tile rather than from its own
 * cue, so the ends of the video -- where there are no frames left to show -- keep the
 * current tile in the middle instead of letting it slide sideways.
 */
const StorySideImageComponent = ({
  uri,
  scale,
  width,
  height,
}: StorySideImageProps) => (
  <View style={ { width, height } }>
    <StoryImage
      uri={ uri }
      scale={ scale }
    />
  </View>
);

const StorySideImage = memo(StorySideImageComponent);

// the strip laid out around the current tile, e.g. [-2, -1, 0, 1, 2]. Both are built
// once here rather than per render: the shape only depends on the device
const buildTileOffsets = (sideTiles: number) => Array.from(
  { length: sideTiles * 2 + 1 },
  (_, position) => position - sideTiles
);

const TV_TILE_OFFSETS = buildTileOffsets(STORYBOARD_SIDE_TILES_TV);
const MOBILE_TILE_OFFSETS = buildTileOffsets(STORYBOARD_SIDE_TILES_MOBILE);

// cues are ordered by start time, so the covering one can be found without walking the list --
// which matters because a long video parses into thousands of them
function findCueIndex(cues: VTTItem[], time: number): number {
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
      return mid;
    }
  }

  return NO_CUE;
}

const PlayerStoryboardComponent = ({
  storyboardUrl,
  currentTime,
  style,
  scale = 1,
}: PlayerStoryboardComponentProps) => {
  const { playerStoryboardAdjacentFrames } = useConfigContext();
  const isTV = useIsTV();
  const [storyboard, setStoryboard] = useState<VTTItem[] | null>([]);
  // the index rather than the tile itself: the adjacent frames are the cues around it
  const [index, setIndex] = useState(NO_CUE);
  const [syncedUrl, setSyncedUrl] = useState<string>(storyboardUrl);

  // a new storyboard invalidates both the parsed cues and the tile currently on screen
  const isUrlStale = syncedUrl !== storyboardUrl;

  if (isUrlStale) {
    setSyncedUrl(storyboardUrl);
    setStoryboard([]);
    setIndex(NO_CUE);
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

  const cues = isUrlStale ? null : storyboard;

  // the tile is derived from the cues plus the playhead, so pick it during render and
  // keep the previous one whenever no cue covers the current time
  const currentIndex = cues ? findCueIndex(cues, currentTime) : NO_CUE;

  if (currentIndex !== NO_CUE && currentIndex !== index) {
    setIndex(currentIndex);
  }

  const uriAt = (position: number) => {
    const cue = cues?.[position];

    return cue ? cue.part.trim() : '';
  };

  const uri = uriAt(index);

  const renderTiles = () => {
    // with nothing resolved yet there is no size to lay the adjacent slots out with,
    // and an empty strip would only take up room
    if (!playerStoryboardAdjacentFrames || !uri) {
      return (
        <StoryImage
          uri={ uri }
          scale={ scale }
        />
      );
    }

    const { width, height } = parseTile(uri, scale);

    const tileOffsets = isTV ? TV_TILE_OFFSETS : MOBILE_TILE_OFFSETS;

    return tileOffsets.map((offset) => {
      if (offset === 0) {
        return (
          <StoryImage
            key={ offset }
            uri={ uri }
            scale={ scale }
          />
        );
      }

      return (
        <StorySideImage
          key={ offset }
          uri={ uriAt(index + offset) }
          scale={ scale * STORYBOARD_SIDE_SCALE }
          width={ width * STORYBOARD_SIDE_SCALE }
          height={ height * STORYBOARD_SIDE_SCALE }
        />
      );
    });
  };

  return (
    <View
      style={ [
        style,
        playerStoryboardAdjacentFrames && {
          flexDirection: 'row' as const,
          alignItems: 'center' as const,
          gap: STORYBOARD_TILE_GAP * scale,
          // the strip is as tall as the middle tile, so a backdrop from the caller --
          // sized to a single tile back when there was only one -- would show up as bars
          // above, below and between the smaller ones. Every tile paints its own.
          backgroundColor: 'transparent' as const,
        },
      ] }
    >
      { renderTiles() }
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
