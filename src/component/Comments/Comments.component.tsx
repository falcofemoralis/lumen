/* eslint-disable react/no-array-index-key */
import ThemedImage from 'Component/ThemedImage';
import ThemedList from 'Component/ThemedList';
import { ThemedListRowProps } from 'Component/ThemedList/ThemedList.type';
import ThemedText from 'Component/ThemedText';
import { memo, useCallback, useState } from 'react';
import { View } from 'react-native';
import { calculateItemSize } from 'Style/Layout';
import { CommentInterface, CommentTextInterface, CommentTextType } from 'Type/Comment.interface';
import { scale } from 'Util/CreateStyles';

import { styles } from './Comments.style';
import { CommentItemProps, CommentsComponentProps } from './Comments.type';

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

export function CommentItem({
  comment,
  idx,
}: CommentItemProps) {
  const {
    id,
    avatar,
    username,
    date,
    text,
  } = comment;

  const renderItemText = () => text.map((textItem, index) => {
    switch (textItem.type) {
      case CommentTextType.BOLD:
        return (
          <ThemedText
            key={ index }
            style={ { fontWeight: 'bold' } }
          >
            { textItem.text }
          </ThemedText>
        );
      case CommentTextType.INCLINED:
        return (
          <ThemedText
            key={ index }
            style={ { fontStyle: 'italic' } }
          >
            { textItem.text }
          </ThemedText>
        );
      case CommentTextType.UNDERLINE:
        return (
          <ThemedText
            key={ index }
            style={ { textDecorationLine: 'underline' } }
          >
            { textItem.text }
          </ThemedText>
        );
      case CommentTextType.CROSSED:
        return (
          <ThemedText
            key={ index }
            style={ { textDecorationLine: 'line-through' } }
          >
            { textItem.text }
          </ThemedText>
        );
      case CommentTextType.BREAK:
        return <ThemedText key={ index }>{ '\n' }</ThemedText>;
      case CommentTextType.SPOILER:
        return (
          <SpoilerItem
            key={ index }
            { ...textItem }
          />
        );
      default:
        return <ThemedText key={ index }>{ textItem.text }</ThemedText>;
    }
  });

  return (
    <View
      key={ id }
      style={ [
        styles.item,
        idx % 2 === 0 ? styles.itemEven : null,
        { paddingLeft: scale(16) * comment.indent },
      ] }
    >
      <ThemedImage
        src={ avatar }
        style={ styles.avatar }
      />
      <View style={ styles.comment }>
        <ThemedText>{ username }</ThemedText>
        <View style={ styles.commentText }>
          { renderItemText() }
        </View>
        <ThemedText>{ date }</ThemedText>
      </View>
    </View>
  );
}

function rowPropsAreEqual(prevProps: CommentItemProps, props: CommentItemProps) {
  return prevProps.comment.id === props.comment.id;
}

const MemoCommentItem = memo(CommentItem, rowPropsAreEqual);

export const CommentsComponent = ({
  comments,
  onNextLoad,
}: CommentsComponentProps) => {
  const itemWidth = calculateItemSize(1);

  const renderRow = useCallback(
    ({ item, index }: ThemedListRowProps<CommentInterface>) => (
      <MemoCommentItem
        comment={ item }
        idx={ index }
      />
    ),
    [],
  );

  return (
    <ThemedList
      style={ styles.list }
      data={ comments }
      numberOfColumns={ 1 }
      itemSize={ itemWidth }
      renderItem={ renderRow }
      onNextLoad={ onNextLoad }
    />
  );
};

export default CommentsComponent;
