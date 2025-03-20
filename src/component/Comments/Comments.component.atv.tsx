import Loader from 'Component/Loader';
import { ThemedGridRowProps } from 'Component/ThemedGrid/ThemedGrid.type';
import ThemedIcon from 'Component/ThemedIcon';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import t from 'i18n/t';
import {
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { LayoutRectangle, View } from 'react-native';
import {
  DefaultFocus,
  SpatialNavigationFocusableView,
  SpatialNavigationVirtualizedList,
} from 'react-tv-space-navigation';
import Colors from 'Style/Colors';
import { CommentInterface, CommentTextType } from 'Type/Comment.interface';
import { scale } from 'Util/CreateStyles';

import { MEASURE_TEXT_STRING } from './Comments.config';
import {
  INDENT_SIZE,
  ITEM_ADDITIONAL_HEIGHT,
  styles,
} from './Comments.style.atv';
import {
  CalculatedLine, CalculatedText, CommentItemProps, CommentsComponentProps,
} from './Comments.type';
import { CommentText, CommentTextRef } from './CommentText.atv';

export function CommentItem({
  comment,
  idx,
  containerWidth = 0,
  lines = [],
}: CommentItemProps) {
  const {
    id,
    avatar,
    username,
    date,
    likes,
  } = comment;

  const commentTextRef = useRef<CommentTextRef>(null);

  const leftIndent = INDENT_SIZE * comment.indent;

  return (
    <SpatialNavigationFocusableView
      onSelect={ () => commentTextRef.current?.openSpoilers() }
    >
      { ({ isFocused }) => (
        <View
          key={ id }
          style={ [
            styles.item,
            idx % 2 === 0 && styles.itemEven,
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
                  <ThemedIcon
                    icon={ {
                      pack: IconPackType.MaterialCommunityIcons,
                      name: 'thumb-up-outline',
                    } }
                    size={ scale(16) }
                    color={ Colors.white }
                  />
                </View>
              ) }
            </View>
          </View>
        </View>
      ) }
    </SpatialNavigationFocusableView>
  );
}

function rowPropsAreEqual(prevProps: CommentItemProps, props: CommentItemProps) {
  return prevProps.comment.id === props.comment.id || prevProps.lines === props.lines;
}

const MemoCommentItem = memo(CommentItem, rowPropsAreEqual);

export const CommentsComponent = ({
  comments,
  style,
  isLoading,
  onNextLoad,
}: CommentsComponentProps) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const [charLayout, setCharLayout] = useState<LayoutRectangle|null>(null);

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
        // eslint-disable-next-line no-plusplus
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

      acc.push({
        lines: splitText(textObj.text, item.indent),
        type: textObj.type,
      });

      return acc;
    }, []);

    const numberOfLines = calculatedLines.reduce((acc, textObj) => acc + textObj.lines.length, 0);

    const charHeight = charLayout?.height || 0;
    const textHeight = numberOfLines * charHeight;

    return {
      height: textHeight + ITEM_ADDITIONAL_HEIGHT,
      lines: calculatedLines,
    };
  }, [charLayout, splitText]);

  const commentCalculatedHeights = useMemo(() => (comments ?? []).reduce((acc, comment) => {
    acc[comment.id] = calculateItemSize(comment);

    return acc;
  }, {} as Record<string, CalculatedText>), [comments, calculateItemSize]);

  const getCalculatedItemSize = useCallback((
    item: CommentInterface,
  ) => commentCalculatedHeights[item.id].height, [commentCalculatedHeights]);

  const getCalculatedItemLines = useCallback((
    item: CommentInterface,
  ) => commentCalculatedHeights[item.id].lines ?? [], [commentCalculatedHeights]);

  const renderItem = useCallback(({ item, index }: ThemedGridRowProps<CommentInterface>) => (
    <MemoCommentItem
      comment={ item }
      idx={ index }
      containerWidth={ containerWidth }
      lines={ getCalculatedItemLines(item) }
    />
  ), [getCalculatedItemLines, containerWidth]);

  const renderComments = () => {
    if (isLoading || !comments) {
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
      <DefaultFocus>
        <SpatialNavigationVirtualizedList
          data={ comments }
          itemSize={ getCalculatedItemSize }
          renderItem={ renderItem }
          onEndReached={ onNextLoad }
          orientation="vertical"
          additionalItemsRendered={ 1 }
          onEndReachedThresholdItemsNumber={ 5 }
        />
      </DefaultFocus>
    );
  };

  /**
   * This is required for correct text height calcluation
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
