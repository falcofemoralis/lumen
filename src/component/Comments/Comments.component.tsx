import ThemedImage from 'Component/ThemedImage';
import ThemedList from 'Component/ThemedList';
import { ThemedListRowProps } from 'Component/ThemedList/ThemedList.type';
import ThemedText from 'Component/ThemedText';
import { memo, useCallback } from 'react';
import { View } from 'react-native';
import { calculateItemSize } from 'Style/Layout';
import { CommentInterface } from 'Type/Comment.interface';
import { scale } from 'Util/CreateStyles';

import { styles } from './Comments.style';
import { CommentItemProps, CommentsComponentProps } from './Comments.type';
import { CommentText } from './CommentText';

export function CommentItem({
  comment,
  idx,
}: CommentItemProps) {
  const {
    id,
    avatar,
    username,
    date,
  } = comment;

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
        <CommentText
          style={ styles.commentText }
          comment={ comment }
        />
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

  const renderItem = useCallback(
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
      renderItem={ renderItem }
      onNextLoad={ onNextLoad }
    />
  );
};

export default CommentsComponent;
