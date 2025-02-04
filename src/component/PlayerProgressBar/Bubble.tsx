import PlayerStoryboard from 'Component/PlayerStoryboard';
import React, {
  memo,
  useImperativeHandle,
  useState,
} from 'react';
import {
  Text,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { convertSecondsToTime } from 'Util/Date';

import { styles } from './PlayerProgressBar.style';

export type BubbleProps = {
  storyboardUrl?: string;
};

export type BubbleRef = {
  setText: (text: string) => void;
};

export const BubbleComponent = React.forwardRef<BubbleRef, BubbleProps>(
  (
    {
      storyboardUrl,
    },
    ref,
  ) => {
    const [time, setTime] = useState(0);

    useImperativeHandle(ref, () => ({
      setText: (text: string) => {
        setTime(Number(text));
      },
    }));

    const renderStoryboard = () => {
      if (!storyboardUrl) {
        return null;
      }

      return (
        <PlayerStoryboard
          style={ styles.storyBoard }
          storyboardUrl={ storyboardUrl }
          currentTime={ time }
        />
      );
    };

    return (
      <Animated.View style={ styles.view }>
        <Animated.View
          style={ styles.bubbleStyle }
        >
          { renderStoryboard() }
          <Text style={ styles.textStyle }>
            { convertSecondsToTime(time) }
          </Text>
        </Animated.View>
      </Animated.View>
    );
  },
);

export const Bubble = memo(BubbleComponent);
