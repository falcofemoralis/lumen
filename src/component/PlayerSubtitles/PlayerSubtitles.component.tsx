/* eslint-disable functional/no-let */
import { useEventListener } from 'expo';
import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
} from 'react-native';
import { subtitleParser, VTTItem } from 'Util/VttParser';

import { styles } from './PlayerSubtitles.style';
import { PlayerSubtitlesComponentProps } from './PlayerSubtitles.type';

export const PlayerSubtitlesComponent = ({
  subtitleUrl,
  player,
  style,
}: PlayerSubtitlesComponentProps) => {
  const [subtitles, setSubtitles] = useState<VTTItem[] | null>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    subtitleParser(subtitleUrl).then((parsedSubtitles) => {
      setSubtitles(parsedSubtitles);
    });
  }, [subtitleUrl]);

  const updateText = (newText: string) => {
    if (newText !== text) {
      setText(newText);
    }
  };

  useEventListener(
    player,
    'timeUpdate',
    ({ currentTime }) => {
      if (!subtitles) {
        return;
      }

      const subtitle = subtitles.find((
        { start, end },
      ) => currentTime >= start && currentTime <= end);

      if (subtitle) {
        updateText(subtitle.part.trim());

        return;
      }

      updateText('');
    },
  );

  return (
    <View style={ [styles.container, style] }>
      { text ? (
        <Text style={ styles.text }>
          { text }
        </Text>
      ) : null }
    </View>
  );
};

export default PlayerSubtitlesComponent;
