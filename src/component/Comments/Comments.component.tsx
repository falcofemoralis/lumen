import { Loader } from 'Component/Loader';
import { ThemedGridRowProps } from 'Component/ThemedGrid/ThemedGrid.type';
import { ThemedImage } from 'Component/ThemedImage';
import { ThemedList } from 'Component/ThemedList';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { ThumbsUp } from 'lucide-react-native';
import { memo, useCallback } from 'react';
import { View } from 'react-native';
import { useAppTheme } from 'Theme/context';
import { CommentInterface } from 'Type/Comment.interface';

import { componentStyles } from './Comments.style';
import { CommentItemProps, CommentsComponentProps } from './Comments.type';
import { CommentText } from './CommentText';

export function CommentItem({
  comment,
  idx,
  styles,
}: CommentItemProps) {
  const {
    id,
    avatar,
    username,
    date,
    likes,
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
          { likes > 0 && (
            <View style={ styles.commentLikes }>
              <ThemedText style={ styles.commentTextSmall }>
                { likes }
              </ThemedText>
              <ThumbsUp
                size={ scale(16) }
                color={ theme.colors.icon }
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
  style,
  onNextLoad,
}: CommentsComponentProps) => {
  const { scale } = useAppTheme();
  const styles = useThemedStyles(componentStyles);

  const renderItem = useCallback(
    ({ item, index }: ThemedGridRowProps<CommentInterface>) => (
      <MemoCommentItem
        comment={ item }
        idx={ index }
        styles={ styles }
      />
    ),
    [styles]
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
