import { setFocus } from '@noriginmedia/norigin-spatial-navigation-core';
import { Loader } from 'Component/Loader';
import { ThemedGrid } from 'Component/ThemedGrid';
import { ThemedGridRowProps } from 'Component/ThemedGrid/ThemedGrid.type';
import { ThemedImage } from 'Component/ThemedImage';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import ThumbsUp from 'lucide-react-native/icons/thumbs-up';
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { LayoutRectangle, useWindowDimensions, View } from 'react-native';
import { useAppTheme } from 'Theme/context';
import { ThemedStyles } from 'Theme/types';
import { CommentInterface, CommentTextType } from 'Type/Comment.interface';

import { CommentActions, CommentActionsRef } from './CommentActions.atv';
import { CommentForm } from './CommentForm.atv';
import { getCommentId, MEASURE_TEXT_STRING } from './Comments.config';
import { componentStyles } from './Comments.style.atv';
import {
  CalculatedLine,
  CalculatedText,
  CommentItemProps,
  CommentsComponentProps,
  SplitCommentInterface,
} from './Comments.type';
import { CommentText, CommentTextRef } from './CommentText.atv';

type CommentItemRef = {
  focus: () => void;
};

// eslint-disable-next-line max-len
export const CommentItem = forwardRef<CommentItemRef, CommentItemProps & { styles: ThemedStyles<typeof componentStyles> }>(({
  comment,
  containerWidth = 0,
  lines = [],
  styles,
  handleReply,
}, ref) => {
  const {
    id,
    avatar,
    username,
    date,
    likes,
    isDisabled,
  } = comment;
  const { scale, theme } = useAppTheme();
  const commentFocusKey = useId();
  const commentTextRef = useRef<CommentTextRef>(null);

  const leftIndent = styles.indentSize.width * comment.indent;

  useImperativeHandle(ref, () => ({
    focus: () => setFocus(commentFocusKey),
  }), [commentFocusKey]);

  return (
    <ThemedPressable
      focusKey={ commentFocusKey }
      onPress={ () => commentTextRef.current?.openSpoilers() }
      onLongPress={ () => handleReply(comment) }
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
              styles={ styles }
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
                    isDisabled && styles.commentTextSmallLiked,
                    isFocused && styles.textFocused,
                  ] }
                  >
                    { likes }
                  </ThemedText>
                  <ThumbsUp
                    size={ scale(16) }
                    color={ isDisabled ? theme.colors.secondary : theme.colors.icon }
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
  return prevProps.comment.id === props.comment.id
  && prevProps.lines === props.lines
  && prevProps.comment.likes === props.comment.likes;
}

const MemoCommentItem = memo(CommentItem, rowPropsAreEqual);

type CommentsListProps = Pick<
  CommentsComponentProps,
  'comments' | 'onNextLoad' | 'canPostComments' | 'handlePostLike'
> & {
  containerWidth: number;
  charLayout: LayoutRectangle | null;
  styles: ThemedStyles<typeof componentStyles>;
  handleReply: (comment: CommentInterface) => void;
};

const CommentsList = ({
  comments,
  onNextLoad,
  containerWidth,
  charLayout,
  styles,
  canPostComments,
  handlePostLike,
  handleReply,
}: CommentsListProps) => {
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
    const width = containerWidth - (indent * styles.indentSize.width);

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
  }, [charLayout, containerWidth, styles]);

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
      height: textHeight + styles.itemAdditionalHeight.height,
      lineHeight: charLayout?.height || 0,
      lines: calculatedLines,
    };
  }, [charLayout, splitText, styles]);

  const commentCalculatedHeights = useMemo(() => (comments ?? []).reduce((acc, comment) => {
    acc[comment.id] = calculateItemSize(comment);

    return acc;
  }, {} as Record<string, CalculatedText>), [comments, calculateItemSize]);

  const stringifiedComments = useMemo(() => (comments ?? []).reduce((acc, comment) => {
    const commentHeight = commentCalculatedHeights[comment.id].height;
    const containerHeight = height - styles.itemAdditionalHeight.height - styles.overlayPadding.padding;

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
          // liking or replying still has to reach the comment the service knows
          originalId: comment.id,
        });
      });
    } else {
      acc.push(comment);
    }

    return acc;
  }, [] as SplitCommentInterface[]), [commentCalculatedHeights, comments, height, styles]);

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
      canPostComments={ canPostComments }
      handlePostLike={ handlePostLike }
      handleReply={ handleReply }
      styles={ styles }
    />
  ), [canPostComments, containerWidth, getCalculatedItemLines, handlePostLike, handleReply, styles]);

  return (
    <ThemedGrid
      numberOfColumns={ 1 }
      data={ stringifiedComments ?? [] }
      renderItem={ renderItem }
      onNextLoad={ onNextLoad }
    />
  );
};

export const CommentsComponent = ({
  comments,
  style,
  isLoading,
  canPostComments,
  isPosting,
  onNextLoad,
  handlePostLike,
  handlePostComment,
}: CommentsComponentProps) => {
  const styles = useThemedStyles(componentStyles);
  const [containerWidth, setContainerWidth] = useState(0);
  const [charLayout, setCharLayout] = useState<LayoutRectangle|null>(null);
  const actionsRef = useRef<CommentActionsRef>(null);

  // With posting switched off there is nothing to choose between, so the long
  // press keeps doing what it always did on TV and likes the comment outright.
  const handleReply = useCallback((comment: CommentInterface) => {
    if (!canPostComments) {
      handlePostLike(getCommentId(comment));

      return;
    }

    actionsRef.current?.open(comment);
  }, [canPostComments, handlePostLike]);

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
      <CommentsList
        comments={ comments }
        onNextLoad={ onNextLoad }
        containerWidth={ containerWidth }
        charLayout={ charLayout }
        styles={ styles }
        canPostComments={ canPostComments }
        handlePostLike={ handlePostLike }
        handleReply={ handleReply }
      />
    );
  };

  // On TV the composer goes above the list: it is the first thing the D-Pad
  // reaches on the way up, and a form pinned below a full-height list would sit
  // off screen. It stays a real sibling of the grid rather than its header -
  // a focusable inside the list pulls focus back to the top whenever a focused
  // item unmounts (virtualization, load-more).
  const renderForm = () => {
    if (!canPostComments) {
      return null;
    }

    return (
      <CommentForm
        isPosting={ isPosting }
        replyTo={ null }
        styles={ styles }
        handlePostComment={ handlePostComment }
      />
    );
  };

  const renderActions = () => {
    if (!canPostComments) {
      return null;
    }

    return (
      <CommentActions
        ref={ actionsRef }
        isPosting={ isPosting }
        styles={ styles }
        handlePostLike={ handlePostLike }
        handlePostComment={ handlePostComment }
      />
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
      { renderForm() }
      { renderComments() }
      { renderActions() }
    </View>
  );
};

export default CommentsComponent;
