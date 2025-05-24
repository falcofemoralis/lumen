import { usePlayerContext } from 'Context/PlayerContext';
import {
  useCallback, useEffect, useRef,
} from 'react';
import { Slider } from 'react-native-awesome-slider';
import { useSharedValue } from 'react-native-reanimated';
import { Colors } from 'Style/Colors';
import { noopFn } from 'Util/Function';

import { Bubble, BubbleRef } from './Bubble';
import { PlayerProgressBarComponentProps } from './PlayerProgressBar.type';

export const PlayerProgressBarComponent = ({
  storyboardUrl,
  seekToPosition,
  calculateCurrentTime,
  handleUserInteraction,
  handleIsScrolling = noopFn,
}: PlayerProgressBarComponentProps) => {
  const { progressStatus } = usePlayerContext();
  const bubbleRef = useRef<BubbleRef>(null);
  const progress = useSharedValue(0);
  const cache = useSharedValue(0);
  const minimumValue = useSharedValue(0);
  const maximumValue = useSharedValue(100);
  const isSliding = useRef(false);

  useEffect(() => {
    const { progressPercentage, playablePercentage } = progressStatus;

    if (isSliding.current) {
      return;
    }

    progress.value = progressPercentage;
    cache.value = playablePercentage;
  }, [progressStatus]);

  const updateIsScrolling = useCallback((value: boolean) => {
    handleIsScrolling(value);
  }, [handleIsScrolling]);

  const bubble = useCallback((seconds: number) => String(seconds), []);

  const setBubbleText = useCallback((text: string) => {
    const value = Number(text);
    const time = calculateCurrentTime(value);

    bubbleRef.current?.setText(time.toString());
  }, [calculateCurrentTime]);

  const onSlidingStart = useCallback(() => {
    isSliding.current = true;
    updateIsScrolling(true);
  }, [updateIsScrolling]);

  const onSlidingComplete = useCallback((value: number) => {
    isSliding.current = false;

    seekToPosition(value);
    updateIsScrolling(false);
    handleUserInteraction();
  }, [seekToPosition, handleUserInteraction, updateIsScrolling]);

  const renderBubble = useCallback(() => (
    <Bubble
      ref={ bubbleRef }
      storyboardUrl={ storyboardUrl }
    />
  ), [storyboardUrl]);

  return (
    <Slider
      progress={ progress }
      cache={ cache }
      minimumValue={ minimumValue }
      maximumValue={ maximumValue }
      bubble={ bubble }
      setBubbleText={ setBubbleText }
      renderBubble={ renderBubble }
      onSlidingStart={ onSlidingStart }
      onSlidingComplete={ onSlidingComplete }
      theme={ {
        minimumTrackTintColor: Colors.secondary,
        cacheTrackTintColor: '#888888aa',
        maximumTrackTintColor: '#555555aa',
        bubbleBackgroundColor: Colors.secondary,
      } }
    />
  );
};

export default PlayerProgressBarComponent;
