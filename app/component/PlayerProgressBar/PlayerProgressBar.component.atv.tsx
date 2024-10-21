import { useRef } from 'react';
import { DimensionValue, Pressable, TVFocusGuideView, useTVEventHandler, View } from 'react-native';
import { PlayerProgressBarComponentProps } from './PlayerProgressBar.type';
import { styles } from './PlayerProgressBar.style.atv';

export function PlayerProgressBarComponentTV(props: PlayerProgressBarComponentProps) {
  const { status, playerRef, focusedElement, setFocusedElement = () => {} } = props;
  const progressThumbRef = useRef(null);

  useTVEventHandler((evt: any) => {
    const type = evt.eventType;

    if (type === 'left' || type === 'right') {
      if (focusedElement === 'progressThumb') {
        playerRef.current?.playFromPositionAsync(0);
      }
    }
  });

  return (
    <View>
      <TVFocusGuideView
        autoFocus
        trapFocusLeft
        trapFocusRight
        destinations={[progressThumbRef.current]}
        style={styles.container}
      >
        {status && status.progressPercentage && status.durationMillis && (
          <>
            {/* Playable Duration */}
            {status.playablePercentage && (
              <View
                style={{
                  ...styles.playableBar,
                  width: (status.playablePercentage + '%') as DimensionValue,
                }}
              ></View>
            )}

            {/* Progress Playback */}
            {status.progressPercentage && (
              <View
                style={[
                  styles.progressBar,
                  { width: (status.progressPercentage + '%') as DimensionValue },
                ]}
              >
                {/* Progress Thumb */}
                <Pressable
                  style={[styles.thumb, focusedElement === 'progressThumb' && styles.focusedThumb]}
                  // hasTVPreferredFocus
                  isTVSelectable={true}
                  key={'progressThumb'}
                  ref={progressThumbRef}
                  onFocus={() => {
                    setFocusedElement('progressThumb');
                  }}
                  onBlur={() => {
                    setFocusedElement('');
                  }}
                ></Pressable>
              </View>
            )}
          </>
        )}
      </TVFocusGuideView>
    </View>
  );
}

export default PlayerProgressBarComponentTV;
