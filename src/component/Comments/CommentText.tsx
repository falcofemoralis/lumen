import ThemedText from 'Component/ThemedText';
import { useState } from 'react';
import {
  StyleProp, TextStyle, View, ViewStyle,
} from 'react-native';
import { CommentInterface, CommentTextInterface, CommentTextType } from 'Type/Comment.interface';

import { styles } from './Comments.style';

interface CommentTextProps {
  comment: CommentInterface
  style?: StyleProp<ViewStyle> | undefined;
  textStyle?: StyleProp<TextStyle>;
}

const SpoilerItem = (textItem: CommentTextInterface) => {
  const [visible, setVisible] = useState(false);

  const { text } = textItem;

  return (
    <ThemedText
      style={ !visible ? styles.spoiler : null }
      onPress={ () => setVisible(!visible) }
    >
      { visible ? text : 'Spoiler' }
    </ThemedText>
  );
};

export const CommentText = ({ comment, style, textStyle }: CommentTextProps) => {
  const { text } = comment;

  const renderText = (textItem: CommentTextInterface) => {
    switch (textItem.type) {
      case CommentTextType.BOLD:
        return (
          <ThemedText
            style={ [textStyle, { fontWeight: 'bold' }] }
          >
            { textItem.text }
          </ThemedText>
        );
      case CommentTextType.INCLINED:
        return (
          <ThemedText
            style={ [textStyle, { fontStyle: 'italic' }] }
          >
            { textItem.text }
          </ThemedText>
        );
      case CommentTextType.UNDERLINE:
        return (
          <ThemedText
            style={ [textStyle, { textDecorationLine: 'underline' }] }
          >
            { textItem.text }
          </ThemedText>
        );
      case CommentTextType.CROSSED:
        return (
          <ThemedText
            style={ [textStyle, { textDecorationLine: 'line-through' }] }
          >
            { textItem.text }
          </ThemedText>
        );
      case CommentTextType.BREAK:
        return null;
      case CommentTextType.SPOILER:
        return (
          <SpoilerItem
            { ...textItem }
          />
        );
      default:
        return (
          <ThemedText style={ textStyle }>
            { textItem.text }
          </ThemedText>
        );
    }
  };

  return (
    <View style={ style }>
      { text.map((textItem, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <View key={ `comment-${comment.id}-${index}-${textItem.text}` }>
          { renderText(textItem) }
        </View>
      )) }
    </View>
  );
};
