import { FocusedElement, RewindDirection } from 'Component/Player/Player.config';
import { useRef } from 'react';
import {
  DimensionValue,
  HWEvent,
  Pressable,
  TVFocusGuideView,
  useTVEventHandler,
  View,
} from 'react-native';
import { TVEventType } from 'Type/TVEvent.type';

import { styles } from './PlayerProgressBar.style.atv';
import { PlayerProgressBarComponentProps } from './PlayerProgressBar.type';

export function PlayerProgressBarComponent({
  status,
  focusedElement,
  setFocusedElement = () => {},
  rewindPosition,
  rewindPositionAuto,
}: PlayerProgressBarComponentProps) {
  const progressThumbRef = useRef(null);

  useTVEventHandler((evt: HWEvent) => {
    const type = evt.eventType;

    if (focusedElement === FocusedElement.ProgressThumb) {
      if (type === TVEventType.Left) {
        rewindPosition(RewindDirection.Backward);
      }

      if (type === TVEventType.Right) {
        rewindPosition(RewindDirection.Forward);
      }

      if (type === TVEventType.LongLeft) {
        rewindPositionAuto(RewindDirection.Backward);
      }

      if (type === TVEventType.LongRight) {
        rewindPositionAuto(RewindDirection.Forward);
      }
    }
  });

  if (!status) {
    return;
  }

  return (
    <TVFocusGuideView
      autoFocus
      trapFocusLeft
      trapFocusRight
      hasTVPreferredFocus
      destinations={ [progressThumbRef.current] }
      style={ styles.container }
    >
      { /* Playable Duration */ }
      <View
        style={ [
          styles.playableBar,
          { width: (`${status.playablePercentage}%`) as DimensionValue },
        ] }
      />
      { /* Progress Playback */ }
      <View
        style={ [
          styles.progressBar,
          { width: (`${status.progressPercentage}%`) as DimensionValue },
        ] }
      >
        { /* Progress Thumb */ }
        <Pressable
          style={ [
            styles.thumb,
            focusedElement === FocusedElement.ProgressThumb && styles.focusedThumb,
          ] }
          hasTVPreferredFocus
          isTVSelectable
          key={ FocusedElement.ProgressThumb }
          ref={ progressThumbRef }
          onFocus={ () => {
            setFocusedElement(FocusedElement.ProgressThumb);
          } }
          onBlur={ () => {
            setFocusedElement('');
          } }
        />
      </View>
    </TVFocusGuideView>
  );
}

export default PlayerProgressBarComponent;
