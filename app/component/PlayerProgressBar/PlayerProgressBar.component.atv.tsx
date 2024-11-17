import { FocusedElement, RewindDirection } from 'Component/Player/Player.config';
import ThemedPressable from 'Component/ThemedPressable';
import { useRef } from 'react';
import { DimensionValue, HWEvent, TVFocusGuideView, useTVEventHandler, View } from 'react-native';
import { TVEventType } from 'Type/TVEvent.type';
import { styles } from './PlayerProgressBar.style.atv';
import { PlayerProgressBarComponentProps } from './PlayerProgressBar.type';

export function PlayerProgressBarComponentTV(props: PlayerProgressBarComponentProps) {
  const {
    status: { progressPercentage, playablePercentage },
    focusedElement,
    setFocusedElement = () => {},
    rewindPosition,
  } = props;
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
    }
  });

  return (
    <TVFocusGuideView
      autoFocus
      trapFocusLeft
      trapFocusRight
      destinations={[progressThumbRef.current]}
      style={styles.container}
    >
      <>
        {/* Playable Duration */}
        <View
          style={[styles.playableBar, { width: (progressPercentage + '%') as DimensionValue }]}
        />

        {/* Progress Playback */}
        <View style={[styles.progressBar, { width: (playablePercentage + '%') as DimensionValue }]}>
          {/* Progress Thumb */}
          <ThemedPressable
            style={[
              styles.thumb,
              focusedElement === FocusedElement.ProgressThumb && styles.focusedThumb,
            ]}
            isTVSelectable={true}
            hasTVPreferredFocus
            key={FocusedElement.ProgressThumb}
            ref={progressThumbRef}
            onFocus={() => {
              setFocusedElement(FocusedElement.ProgressThumb);
            }}
            onBlur={() => {
              setFocusedElement('');
            }}
          />
        </View>
      </>
    </TVFocusGuideView>
  );
}

export default PlayerProgressBarComponentTV;
