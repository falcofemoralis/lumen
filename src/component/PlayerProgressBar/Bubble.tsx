import { PlayerStoryboard } from 'Component/PlayerStoryboard';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Text,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { convertSecondsToTime } from 'Util/Date';

import { componentStyles } from './PlayerProgressBar.style';

export type BubbleProps = {
  storyboardUrl?: string;
};

export type BubbleRef = {
  setText: (text: string) => void;
};

export const BubbleComponent = forwardRef<BubbleRef, BubbleProps>(
  (
    {
      storyboardUrl,
    },
    ref
  ) => {
    const [time, setTime] = useState(0);
    const styles = useThemedStyles(componentStyles);

    // the slider pushes a value from the UI thread on every gesture frame. Committing each one
    // re-renders the storyboard faster than the JS thread can drain the queue, so a fast drag
    // backs it up and the tile appears frozen. Coalesce to at most one commit per frame, and
    // only when the whole second actually changed -- neither the label nor the cue lookup
    // resolves any finer than that.
    const pendingTime = useRef(0);
    const frame = useRef<number | null>(null);

    useImperativeHandle(ref, () => ({
      setText: (text: string) => {
        const next = Math.round(Number(text));

        if (next === pendingTime.current) {
          return;
        }

        pendingTime.current = next;

        if (frame.current !== null) {
          return;
        }

        frame.current = requestAnimationFrame(() => {
          frame.current = null;
          setTime(pendingTime.current);
        });
      },
    }), []);

    useEffect(() => () => {
      if (frame.current !== null) {
        cancelAnimationFrame(frame.current);
      }
    }, []);

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
  }
);

export const Bubble = memo(BubbleComponent);
