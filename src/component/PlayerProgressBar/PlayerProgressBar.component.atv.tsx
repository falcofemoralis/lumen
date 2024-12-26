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
import { SpatialNavigationFocusableView, SpatialNavigationNode, SpatialNavigationView } from 'react-tv-space-navigation';
import { TVEventType } from 'Type/TVEvent.type';

import { styles } from './PlayerProgressBar.style.atv';
import { PlayerProgressBarComponentProps } from './PlayerProgressBar.type';

export function PlayerProgressBarComponent({
  status,
  focusedElement,
  setFocusedElement = () => {},
  rewindPosition,
  rewindPositionAuto,
  toggleControls,
}: PlayerProgressBarComponentProps) {
  const progressThumbRef = useRef(null);

  useTVEventHandler((evt: HWEvent) => {
    const type = evt.eventType;

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
  });

  // if (!status) {
  //   return;
  // }

  return (
    <View
      // autoFocus
      // trapFocusLeft
      // trapFocusRight
      // hasTVPreferredFocus
      // destinations={ [progressThumbRef.current] }
      style={ styles.container }
    >
      <SpatialNavigationView direction="horizontal">
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
          <SpatialNavigationFocusableView
            onSelect={ () => {
              console.log('onSelect2');
              toggleControls();
            } }
            onFocus={ () => {
              setFocusedElement(FocusedElement.ProgressThumb);
            } }
            onBlur={ () => {
              setFocusedElement('');
            } }
          >
            { ({ isFocused }) => (
              <View
                style={ [
                  styles.thumb,
                  isFocused && styles.focusedThumb,
                ] }
              // hasTVPreferredFocus
              // isTVSelectable
              // key={ FocusedElement.ProgressThumb }
              // ref={ progressThumbRef }
              />
            ) }
          </SpatialNavigationFocusableView>
        </View>
      </SpatialNavigationView>
    </View>
  );
}

export default PlayerProgressBarComponent;
