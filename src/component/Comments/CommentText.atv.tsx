import ThemedText from 'Component/ThemedText';
import { forwardRef, useImperativeHandle, useState } from 'react';
import {
  StyleProp, TextStyle, View, ViewStyle,
} from 'react-native';
import { CommentInterface, CommentTextType } from 'Type/Comment.interface';

import { styles } from './Comments.style.atv';
import { CalculatedLine } from './Comments.type';

interface CommentTextProps {
  comment: CommentInterface
  style?: StyleProp<ViewStyle> | undefined;
  textStyle?: StyleProp<TextStyle>;
  lines: CalculatedLine[];
}

export type CommentTextRef = {
  openSpoilers: () => void;
}

export const CommentText = forwardRef<CommentTextRef, CommentTextProps>(
  (
    {
      comment,
      style,
      textStyle,
      lines,
    },
    ref
  ) => {
    const [isSpoilersVisible, setSpoilersVisible] = useState(false);

    useImperativeHandle(ref, () => ({
      openSpoilers: () => {
        setSpoilersVisible(true);
      },
    }));

    const renderLines = (text: string[], nStyle?: StyleProp<TextStyle>) => text.map((line, idx) => (
      <ThemedText
        // eslint-disable-next-line react/no-array-index-key
        key={ `comment-${comment.id}-${line}-${idx}` }
        style={ [textStyle, nStyle] }
      >
        { line }
      </ThemedText>
    ));

    const renderSpoiler = (text: string[]) => text.map((line, idx) => (
      <ThemedText
        // eslint-disable-next-line react/no-array-index-key
        key={ `comment-${comment.id}-${line}-${idx}` }
        style={ [textStyle, isSpoilersVisible ? null : styles.spoiler] }
      >
        { line }
      </ThemedText>
    ));

    const renderText = (text: string[], type: CommentTextType) => {
      switch (type) {
        case CommentTextType.BOLD:
          return renderLines(text, { fontWeight: 'bold' });
        case CommentTextType.INCLINED:
          return renderLines(text, { fontStyle: 'italic' });
        case CommentTextType.UNDERLINE:
          return renderLines(text, { textDecorationLine: 'underline' });
        case CommentTextType.CROSSED:
          return renderLines(text, { textDecorationLine: 'line-through' });
        case CommentTextType.BREAK:
          return null;
        case CommentTextType.SPOILER:
          return renderSpoiler(text);
        default:
          return renderLines(text);
      }
    };

    return (
      <View style={ style }>
        { lines.map((item, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <View key={ `comment-${comment.id}-${index}` }>
            { renderText(item.lines, item.type) }
          </View>
        )) }
      </View>
    );
  }
);
