import Loader from 'Component/Loader';
import { ThemedGridRowProps } from 'Component/ThemedGrid/ThemedGrid.type';
import ThemedImage from 'Component/ThemedImage';
import ThemedList from 'Component/ThemedList';
import ThemedPressable from 'Component/ThemedPressable';
import ThemedText from 'Component/ThemedText';
import t from 'i18n/t';
import { ThumbsUp } from 'lucide-react-native';
import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { LayoutRectangle, useWindowDimensions, View } from 'react-native';
import {
  SpatialNavigationNodeRef,
} from 'react-tv-space-navigation';
import { Colors } from 'Style/Colors';
import { CommentInterface, CommentTextType } from 'Type/Comment.interface';
import { scale } from 'Util/CreateStyles';

import { MEASURE_TEXT_STRING } from './Comments.config';
import {
  INDENT_SIZE,
  ITEM_ADDITIONAL_HEIGHT,
  OVERLAY_PADDING,
  styles,
} from './Comments.style.atv';
import {
  CalculatedLine, CalculatedText, CommentItemProps, CommentsComponentProps,
} from './Comments.type';
import { CommentText, CommentTextRef } from './CommentText.atv';

type CommentItemRef = {
  focus: () => void;
};

export const CommentItem = forwardRef<CommentItemRef, CommentItemProps>(({
  comment,
  containerWidth = 0,
  lines = [],
}, ref) => {
  const {
    id,
    avatar,
    username,
    date,
    likes,
  } = comment;

  const commentRef = useRef<SpatialNavigationNodeRef>(null);
  const commentTextRef = useRef<CommentTextRef>(null);

  const leftIndent = INDENT_SIZE * comment.indent;

  useImperativeHandle(ref, () => ({
    focus: () => commentRef.current?.focus(),
  }), [commentRef]);

  return (
    <ThemedPressable
      spatialRef={ commentRef }
      onPress={ () => commentTextRef.current?.openSpoilers() }
    >
      { ({ isFocused }) => (
        <View
          key={ id }
          style={ [
            styles.item,
            {
              paddingLeft: leftIndent,
            },
          ] }
        >
          <ThemedImage
            src={ avatar }
            style={ styles.avatar }
          />
          <View style={ [
            styles.comment,
            { width: containerWidth - leftIndent },
            isFocused && styles.itemFocused,
          ] }
          >
            <ThemedText style={ [
              styles.commentTextSmall,
              isFocused && styles.textFocused,
            ] }
            >
              { username }
            </ThemedText>
            <CommentText
              ref={ commentTextRef }
              style={ styles.commentTextWrapper }
              textStyle={ [
                styles.commentText,
                isFocused && styles.commentTextFocused,
              ] }
              comment={ comment }
              lines={ lines }
            />
            <View style={ styles.commentDateRow }>
              <ThemedText style={ [
                styles.commentTextSmall,
                isFocused && styles.textFocused,
              ] }
              >
                { date }
              </ThemedText>
              { likes > 0 && (
                <View style={ styles.commentLikes }>
                  <ThemedText style={ [
                    styles.commentTextSmall,
                    isFocused && styles.textFocused,
                  ] }
                  >
                    { likes }
                  </ThemedText>
                  <ThumbsUp
                    size={ scale(16) }
                    color={ Colors.white }
                  />
                </View>
              ) }
            </View>
          </View>
        </View>
      ) }
    </ThemedPressable>
  );
});

function rowPropsAreEqual(prevProps: CommentItemProps, props: CommentItemProps) {
  return prevProps.comment.id === props.comment.id || prevProps.lines === props.lines;
}

const MemoCommentItem = memo(CommentItem, rowPropsAreEqual);

const CommentsList = ({
  comments,
  onNextLoad,
  containerWidth,
  charLayout,
}: CommentsComponentProps & {
  containerWidth: number;
  charLayout: LayoutRectangle | null;
}) => {
  const { height } = useWindowDimensions();
  const defaultItemRef = useRef<CommentItemRef>(null);

  useEffect(() => {
    setTimeout(() => {
      if (defaultItemRef.current) {
        defaultItemRef.current?.focus();
      }
    }, 0);
  }, []);

  const splitText = useCallback((str: string, indent: number) => {
    const width = containerWidth - (indent * INDENT_SIZE);

    const charWidth = Math.ceil((charLayout?.width || 1) / MEASURE_TEXT_STRING.length);

    const words = str.split(' ');
    const lines = [];

    let currentLine = '';
    words.forEach((w) => {
      const word = w;
      const newLine = `${currentLine}${currentLine === '' ? '' : ' '}${word}`;
      const lineWidth = newLine.length * charWidth;

      if (lineWidth <= width) {
        currentLine = newLine;
      } else if ((word.length * charWidth) > width) {
        // if the word is longer than the width, split the word
        let splitWord = '';

        for (let i = 0; i < word.length; i++) {
          if ((splitWord.length + 1) * charWidth > width) {
            lines.push(splitWord);
            splitWord = '';
          }
          splitWord += word[i];
        }

        if (splitWord) {
          currentLine = splitWord;
        }
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }, [charLayout, containerWidth]);

  const calculateItemSize = useCallback((item: CommentInterface): CalculatedText => {
    const commentText = item.text;

    const calculatedLines = commentText.reduce<CalculatedLine[]>((acc, textObj) => {
      if (textObj.type === CommentTextType.BREAK) {
        return acc;
      }

      const lines = splitText(textObj.text, item.indent);

      acc.push({
        lines: splitText(textObj.text, item.indent),
        totalHeight: lines.length * (charLayout?.height || 0),
        type: textObj.type,
      });

      return acc;
    }, []);

    const textHeight = calculatedLines.reduce((acc, textObj) => acc + textObj.totalHeight, 0);

    return {
      height: textHeight + ITEM_ADDITIONAL_HEIGHT,
      lineHeight: charLayout?.height || 0,
      lines: calculatedLines,
    };
  }, [charLayout, splitText]);

  const commentCalculatedHeights = useMemo(() => (comments ?? []).reduce((acc, comment) => {
    acc[comment.id] = calculateItemSize(comment);

    return acc;
  }, {} as Record<string, CalculatedText>), [comments, calculateItemSize]);

  const stringifiedComments = useMemo(() => (comments ?? []).reduce((acc, comment) => {
    const commentHeight = commentCalculatedHeights[comment.id].height;
    const containerHeight = height - ITEM_ADDITIONAL_HEIGHT - OVERLAY_PADDING;

    // if comment height is more than possible to show on the screen, we need to split it into multiple comments
    if (commentHeight > containerHeight) {
      let accumulatedHeight = 0;
      let lineIndex = 0;
      const calculatedText = commentCalculatedHeights[comment.id] ?? { lines: [] };
      const splittedLines = [] as Record<number, CalculatedLine[]>;

      // sum up lines container height until it reaches the container height
      calculatedText.lines?.forEach((line, idx) => {
        if (!splittedLines[lineIndex]) {
          splittedLines[lineIndex] = [];
        }

        if ((accumulatedHeight + line.totalHeight) > containerHeight) {
          lineIndex++;

          if (!splittedLines[lineIndex]) {
            splittedLines[lineIndex] = [];
          }

          // if comment line is a single line, that can't be easily splitted, we need to split its text into multiple lines
          // if (line.totalHeight > containerHeight) {
          const innerLines = [] as Record<number, string[]>;
          let innerAccumulatedHeight = 0;
          let innerLineIndex = 0;

          // sum up lines text height until it reaches the container height
          line.lines.forEach((innerLine) => {
            if (!innerLines[innerLineIndex]) {
              innerLines[innerLineIndex] = [];
            }

            if ((innerAccumulatedHeight + calculatedText.lineHeight) > containerHeight) {
              innerLineIndex++;

              if (!innerLines[innerLineIndex]) {
                innerLines[innerLineIndex] = [];
              }

              innerLines[innerLineIndex].push(innerLine);
              innerAccumulatedHeight = 0;
            } else {
              innerLines[innerLineIndex].push(innerLine);
              innerAccumulatedHeight += calculatedText.lineHeight;
            }
          });

          Object.values(innerLines).forEach((lns) => {
            if (!splittedLines[lineIndex]) {
              splittedLines[lineIndex] = [];
            }

            splittedLines[lineIndex].push({
              ...line,
              lines: lns,
            });
            lineIndex++;
          });

          accumulatedHeight = 0;
        } else {
          splittedLines[lineIndex].push(line);
          accumulatedHeight += line.totalHeight;
        }
      });

      Object.values(splittedLines).forEach((lns, idx) => {
        const virtualId = `${comment.id}-${idx}`;

        if (!commentCalculatedHeights[virtualId]) {
          commentCalculatedHeights[virtualId] = { ...calculatedText };
        }

        commentCalculatedHeights[virtualId] = {
          ...calculatedText,
          lines: lns,
          height: lns.length * calculatedText.lineHeight,
        } as CalculatedText;

        acc.push({
          ...comment,
          id: virtualId,
        });
      });
    } else {
      acc.push(comment);
    }

    return acc;
  }, [] as CommentInterface[]), [commentCalculatedHeights, comments, height]);

  const getCalculatedItemSize = useCallback((
    item: CommentInterface
  ) => commentCalculatedHeights[item.id].height, [commentCalculatedHeights]);

  const getCalculatedItemLines = useCallback((
    item: CommentInterface
  ) => commentCalculatedHeights[item.id].lines ?? [], [commentCalculatedHeights]);

  const renderItem = useCallback(({ item, index }: ThemedGridRowProps<CommentInterface>) => (
    <MemoCommentItem
      ref={ index === 0 ? defaultItemRef : null }
      comment={ item }
      idx={ index }
      containerWidth={ containerWidth }
      lines={ getCalculatedItemLines(item) }
    />
  ), [getCalculatedItemLines, containerWidth]);

  return (
    <ThemedList
      data={ stringifiedComments ?? [] }
      renderItem={ renderItem }
      getEstimatedItemSize={ (_, item) => getCalculatedItemSize(item) }
      onNextLoad={ onNextLoad }
    />
  );
};

export const CommentsComponent = ({
  comments,
  style,
  isLoading,
  onNextLoad,
}: CommentsComponentProps) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const [charLayout, setCharLayout] = useState<LayoutRectangle|null>(null);

  const renderComments = () => {
    if (!comments || (isLoading && !comments.length)) {
      return (
        <View style={ styles.loader }>
          <Loader
            isLoading
            fullScreen
          />
        </View>
      );
    }

    if (!comments.length) {
      return (
        <View style={ styles.noComments }>
          <ThemedText style={ styles.noCommentsText }>
            { t('No comments yet') }
          </ThemedText>
        </View>
      );
    }

    return (
      // <DefaultFocus>
      <CommentsList
        comments={ comments }
        style={ style }
        isLoading={ isLoading }
        onNextLoad={ onNextLoad }
        containerWidth={ containerWidth }
        charLayout={ charLayout }
      />
      // </DefaultFocus>
    );
  };

  /**
   * This is required for correct text height calculation
   */
  const renderMeasureText = () => (
    <View
      style={ styles.measureText }
      onLayout={ (event) => {
        setCharLayout(event.nativeEvent.layout);
      } }
    >
      <ThemedText
        style={ styles.commentText }
      >
        { MEASURE_TEXT_STRING }
      </ThemedText>
    </View>
  );

  return (
    <View
      style={ [styles.wrapper, style] }
      onLayout={ (event) => {
        const { width } = event.nativeEvent.layout;
        setContainerWidth(width - styles.avatar.width - styles.item.gap);
      } }
    >
      { renderMeasureText() }
      { renderComments() }
    </View>
  );
};

export default CommentsComponent;
