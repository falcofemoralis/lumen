import { Loader } from 'Component/Loader';
import { ThemedGridRowProps } from 'Component/ThemedGrid/ThemedGrid.type';
import { ThemedImage } from 'Component/ThemedImage';
import { ThemedList } from 'Component/ThemedList';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { ThumbsUp } from 'lucide-react-native';
import { memo, useCallback } from 'react';
import { View } from 'react-native';
import { useAppTheme } from 'Theme/context';
import { ThemedStyles } from 'Theme/types';
import { CommentInterface } from 'Type/Comment.interface';

import { componentStyles } from './Comments.style';
import { CommentItemProps, CommentsComponentProps } from './Comments.type';
import { CommentText } from './CommentText';

export function CommentItem({
  comment,
  idx,
  styles,
  handlePostLike,
}: CommentItemProps & { styles: ThemedStyles<typeof componentStyles> }) {
  const {
    id,
    avatar,
    username,
    date,
    likes,
    isDisabled,
  } = comment;
  const { scale, theme } = useAppTheme();
  const leftIndent = styles.indentSize.width * comment.indent;

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
          styles={ styles }
        />
        <View style={ styles.commentDateRow }>
          <ThemedText style={ styles.commentTextSmall }>
            { date }
          </ThemedText>
          <View style={ styles.commentLikes }>
            { likes > 0 && (
              <ThemedText
                style={ [
                  styles.commentTextSmall,
                  isDisabled && styles.commentTextSmallLiked,
                ] }
              >
                { likes ?? 0 }
              </ThemedText>
            ) }
            <ThemedPressable
              contentStyle={ styles.commentLikesBtn }
              onPress={ () => handlePostLike(comment.id) }
            >
              <ThumbsUp
                size={ scale(16) }
                color={ isDisabled ? theme.colors.secondary : theme.colors.icon }
              />
            </ThemedPressable>
          </View>
        </View>
      </View>
    </View>
  );
}

function rowPropsAreEqual(prevProps: CommentItemProps, props: CommentItemProps) {
  return prevProps.comment.id === props.comment.id && prevProps.comment.likes === props.comment.likes;
}

const MemoCommentItem = memo(CommentItem, rowPropsAreEqual);

export const CommentsComponent = ({
  comments,
  isLoading,
  onNextLoad,
  handlePostLike,
}: CommentsComponentProps) => {
  const { scale } = useAppTheme();
  const styles = useThemedStyles(componentStyles);

  const renderItem = useCallback(
    ({ item, index }: ThemedGridRowProps<CommentInterface>) => (
      <MemoCommentItem
        comment={ item }
        idx={ index }
        styles={ styles }
        handlePostLike={ handlePostLike }
      />
    ),
    [styles, handlePostLike]
  );

  if (!comments || (isLoading && !comments.length)) {
    return (
      <View style={ styles.loader }>
        <Loader isLoading fullScreen />
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
    <ThemedList
      data={ comments }
      estimatedItemSize={ scale(100) }
      renderItem={ renderItem }
      onNextLoad={ onNextLoad }
    />
  );
};

export default CommentsComponent;
