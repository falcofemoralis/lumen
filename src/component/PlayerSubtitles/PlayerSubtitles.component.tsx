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

  const renderText = () => {
    if (text.includes('<i>')) {
      return (
        <Text
          style={ [
            styles.text,
            { fontStyle: 'italic' },
          ] }
        >
          { text.replace(/<\/?i>/g, '') }
        </Text>
      );
    }

    if (text.includes('<b>')) {
      return (
        <Text
          style={ [
            styles.text,
            { fontWeight: 'bold' },
          ] }
        >
          { text.replace(/<\/?b>/g, '') }
        </Text>
      );
    }

    return (
      <Text style={ styles.text }>
        { text }
      </Text>
    );
  };

  return (
    <View style={ [styles.container, style] }>
      { text ? renderText() : null }
    </View>
  );
};

export default PlayerSubtitlesComponent;
