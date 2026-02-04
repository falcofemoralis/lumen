import { ThemedText } from 'Component/ThemedText';
import { useState } from 'react';
import { StyleProp, TextStyle, View, ViewStyle } from 'react-native';
import { CommentInterface, CommentTextInterface, CommentTextType } from 'Type/Comment.interface';

interface CommentTextProps {
  comment: CommentInterface
  style?: StyleProp<ViewStyle> | undefined;
  textStyle?: StyleProp<TextStyle>;
  styles: any;
}

interface SpoilerItemProps {
  textItem: CommentTextInterface,
  textStyle?: StyleProp<TextStyle>,
  styles: any,
}

const SpoilerItem = ({
  textItem,
  textStyle,
  styles,
}: SpoilerItemProps) => {
  const [visible, setVisible] = useState(false);

  const { text } = textItem;

  return (
    <ThemedText
      style={ [
        textStyle,
        !visible ? styles.spoiler : null,
      ] }
      onPress={ () => setVisible(!visible) }
    >
      { text }
    </ThemedText>
  );
};

export const CommentText = ({ comment, style, textStyle, styles }: CommentTextProps) => {
  const { text: commentText } = comment;

  const renderLines = (text: string, nStyle?: StyleProp<TextStyle>) => (
    <ThemedText
      style={ [textStyle, nStyle] }
    >
      { text }
    </ThemedText>
  );

  const renderSpoiler = (textItem: CommentTextInterface) => (
    <SpoilerItem
      textItem={ textItem }
      textStyle={ textStyle }
      styles={ styles }
    />
  );

  const renderText = (textItem: CommentTextInterface) => {
    const { text, type } = textItem;

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
        return renderSpoiler(textItem);
      default:
        return renderLines(text);
    }
  };

  return (
    <View style={ style }>
      { commentText.map((textItem, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <View key={ `comment-${comment.id}-${index}-${textItem.text}` }>
          { renderText(textItem) }
        </View>
      )) }
    </View>
  );
};
