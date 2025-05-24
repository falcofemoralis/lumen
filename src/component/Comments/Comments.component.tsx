import Loader from 'Component/Loader';
import ThemedGrid from 'Component/ThemedGrid';
import { ThemedGridRowProps } from 'Component/ThemedGrid/ThemedGrid.type';
import ThemedIcon from 'Component/ThemedIcon';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import t from 'i18n/t';
import { memo, useCallback } from 'react';
import { View } from 'react-native';
import { Colors } from 'Style/Colors';
import { CommentInterface } from 'Type/Comment.interface';
import { scale } from 'Util/CreateStyles';

import { INDENT_SIZE, styles } from './Comments.style';
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
    likes,
  } = comment;

  const leftIndent = INDENT_SIZE * comment.indent;

  return (
    <View
      key={ id }
      style={ [
        styles.item,
        idx % 2 === 0 ? styles.itemEven : null,
        {
          paddingLeft: leftIndent,

        },
      ] }
    >
      <ThemedImage
        src={ avatar }
        style={ styles.avatar }
      />
      <View style={ styles.comment }>
        <ThemedText style={ styles.commentTextSmall }>
          { username }
        </ThemedText>
        <CommentText
          style={ styles.commentTextWrapper }
          textStyle={ styles.commentText }
          comment={ comment }
        />
        <View style={ styles.commentDateRow }>
          <ThemedText style={ styles.commentTextSmall }>
            { date }
          </ThemedText>
          { likes > 0 && (
            <View style={ styles.commentLikes }>
              <ThemedText style={ styles.commentTextSmall }>
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
  );
}

function rowPropsAreEqual(prevProps: CommentItemProps, props: CommentItemProps) {
  return prevProps.comment.id === props.comment.id;
}

const MemoCommentItem = memo(CommentItem, rowPropsAreEqual);

export const CommentsComponent = ({
  comments,
  isLoading,
  loaderFullScreen,
  onNextLoad,
}: CommentsComponentProps) => {
  const renderItem = useCallback(
    ({ item, index }: ThemedGridRowProps<CommentInterface>) => (
      <MemoCommentItem
        comment={ item }
        idx={ index }
      />
    ),
    [],
  );

  if (!comments || (isLoading && !comments.length)) {
    return (
      <View style={ styles.loader }>
        <Loader
          isLoading
          fullScreen={ loaderFullScreen }
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
    <ThemedGrid
      style={ styles.commentsList }
      data={ comments }
      numberOfColumns={ 1 }
      itemSize={ scale(100) }
      renderItem={ renderItem }
      onNextLoad={ onNextLoad }
    />
  );
};

export default CommentsComponent;
