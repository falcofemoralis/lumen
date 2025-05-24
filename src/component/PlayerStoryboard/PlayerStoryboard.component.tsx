/* eslint-disable functional/no-let */
import { Image } from 'expo-image';
import { memo, useEffect, useState } from 'react';
import { View } from 'react-native';
import { Colors } from 'Style/Colors';
import { storyboardParser, VTTItem } from 'Util/VttParser';

import { STORYBOARD_TILE_HEIGHT, STORYBOARD_TILE_WIDTH, STORYBOARD_TILES_COUNT } from './PlayerStoryboard.config';
import { styles } from './PlayerStoryboard.style';
import { PlayerStoryboardComponentProps } from './PlayerStoryboard.type';

interface StoryImageProps {
  uri: string;
  scale?: number;
}

export const CacheImage = ({ uri }: { uri: string }) => (
  <Image
    style={ styles.image }
    source={ { uri } }
  />
);

function imagePropsAreEqual(prevProps: StoryImageProps, props: StoryImageProps) {
  return prevProps.uri === props.uri;
}

const MemoizedCacheImage = memo(CacheImage, imagePropsAreEqual);

const StoryImage = ({ uri, scale = 1 }: StoryImageProps) => {
  if (!uri) {
    return null;
  }

  const split = uri.split('#');
  const baseUri = split[0];
  let offsetX = 0;
  let offsetY = 0;
  let width = STORYBOARD_TILE_WIDTH;
  let height = STORYBOARD_TILE_HEIGHT;

  if (split.length > 1) {
    const params = new URLSearchParams(split[1]);
    const xywh = params.get('xywh');
    if (xywh) {
      const [x, y, w, h] = xywh.split(',').map(Number);
      offsetX = x * scale;
      offsetY = y * scale;
      width = w * scale;
      height = h * scale;
    }
  }

  return (
    <View
      style={ {
        width,
        height,
        backgroundColor: Colors.black,
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

const PlayerStoryboardComponent = ({
  storyboardUrl,
  currentTime,
  style,
  scale,
}: PlayerStoryboardComponentProps) => {
  const [storyboard, setStoryboard] = useState<VTTItem[] | null>([]);
  const [img, setImg] = useState<string>('');

  useEffect(() => {
    storyboardParser(storyboardUrl).then((parsedStoryboard) => {
      setStoryboard(parsedStoryboard);
    });
  }, [storyboardUrl]);

  const updateImg = (newImg: string) => {
    if (newImg !== img) {
      setImg(newImg);
    }
  };

  useEffect(() => {
    if (!storyboard) {
      return;
    }

    const item = storyboard.find((
      { start, end },
    ) => currentTime >= start && currentTime <= end);

    if (item) {
      updateImg(item.part.trim());
    }
  }, [currentTime]);

  return (
    <View style={ [styles.container, style] }>
      <StoryImage
        uri={ img }
        scale={ scale }
      />
    </View>
  );
};

function storyboardPropsAreEqual(
  prevProps: PlayerStoryboardComponentProps,
  props: PlayerStoryboardComponentProps,
) {
  return prevProps.storyboardUrl === props.storyboardUrl
    && prevProps.currentTime === props.currentTime;
}

export default memo(PlayerStoryboardComponent, storyboardPropsAreEqual);
