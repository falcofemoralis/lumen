import { ThemedText } from 'Component/ThemedText';
import { StyleProp, Text, TextStyle } from 'react-native';
import { CommentSegmentInterface } from 'Util/LocalComments/tags';

interface CommentSegmentsTextProps {
  segments: CommentSegmentInterface[];
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}

const styleForSegment = ({
  isBold,
  isItalic,
  isUnderline,
  isCrossed,
}: CommentSegmentInterface): TextStyle => {
  // Both decorations at once is one combined value, not two declarations
  const decorations = [
    isUnderline ? 'underline' : '',
    isCrossed ? 'line-through' : '',
  ].filter(Boolean).join(' ');

  return {
    fontWeight: isBold ? 'bold' : 'normal',
    fontStyle: isItalic ? 'italic' : 'normal',
    textDecorationLine: (decorations || 'none') as TextStyle['textDecorationLine'],
  };
};

/**
 * The tagged runs of a comment body, drawn as one block of text so the row's
 * line cap still applies. The runs are plain `Text`: nested inside a `Text` they
 * inherit the size and colour set here, which a `ThemedText` would reset to its
 * own defaults.
 */
export const CommentSegmentsText = ({ segments, style, numberOfLines }: CommentSegmentsTextProps) => (
  <ThemedText
    style={ style }
    numberOfLines={ numberOfLines }
  >
    { segments.map((segment, index) => (
      <Text
        // eslint-disable-next-line react/no-array-index-key
        key={ `segment-${index}-${segment.text}` }
        style={ styleForSegment(segment) }
      >
        { segment.text }
      </Text>
    )) }
  </ThemedText>
);

export default CommentSegmentsText;
