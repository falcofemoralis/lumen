import { Loader } from 'Component/Loader';
import { ThemedBottomSheet } from 'Component/ThemedBottomSheet';
import { ThemedGrid } from 'Component/ThemedGrid';
import { ThemedGridRowProps } from 'Component/ThemedGrid/ThemedGrid.type';
import { ThemedImage } from 'Component/ThemedImage';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { Wrapper } from 'Component/Wrapper';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import Reply from 'lucide-react-native/icons/reply';
import ThumbsUp from 'lucide-react-native/icons/thumbs-up';
import { memo, useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from 'Theme/context';
import { ThemedStyles } from 'Theme/types';
import { CommentInterface } from 'Type/Comment.interface';

import { CommentForm } from './CommentForm';
import { COMMENTS_SHEET_DETENTS } from './Comments.config';
import { componentStyles } from './Comments.style';
import { CommentItemProps, CommentsComponentProps } from './Comments.type';
import { CommentText } from './CommentText';

export function CommentItem({
  comment,
  idx,
  styles,
  canPostComments,
  handlePostLike,
  handleReply,
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
          <View style={ styles.commentActions }>
            { canPostComments && (
              <ThemedPressable
                contentStyle={ styles.commentActionBtn }
                onPress={ () => handleReply(comment) }
              >
                <Reply
                  size={ scale(16) }
                  color={ theme.colors.icon }
                />
                <ThemedText style={ styles.commentReplyText }>
                  { t('Reply') }
                </ThemedText>
              </ThemedPressable>
            ) }
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
                disabled={ !canPostComments }
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
    </View>
  );
}

function rowPropsAreEqual(prevProps: CommentItemProps, props: CommentItemProps) {
  return prevProps.comment.id === props.comment.id
    && prevProps.comment.likes === props.comment.likes
    && prevProps.canPostComments === props.canPostComments;
}

const MemoCommentItem = memo(CommentItem, rowPropsAreEqual);

export const CommentsComponent = ({
  comments,
  style,
  isLoading,
  loaderFullScreen,
  disableRefresh,
  sheetRef,
  canPostComments,
  isPosting,
  replyTo,
  onNextLoad,
  handleStartLoad,
  handlePostLike,
  handleReply,
  handlePostComment,
}: CommentsComponentProps) => {
  const styles = useThemedStyles(componentStyles);
  const { bottom } = useSafeAreaInsets();
  // The footer floats over the sheet, so the list has to end above it
  const [footerHeight, setFooterHeight] = useState(0);

  const renderItem = useCallback(
    ({ item, index }: ThemedGridRowProps<CommentInterface>) => (
      <MemoCommentItem
        comment={ item }
        idx={ index }
        styles={ styles }
        canPostComments={ canPostComments }
        handlePostLike={ handlePostLike }
        handleReply={ handleReply }
      />
    ),
    [styles, canPostComments, handlePostLike, handleReply]
  );

  // Kept inside the list rather than returned early: TrueSheet pins the ScrollView to the
  // sheet behavior when it presents, and only re-checks on direct children of its content
  // view. A list that mounts once the fetch resolves is never found, so the sheet swallows
  // the drags instead of scrolling.
  const listEmptyComponent = useMemo(() => (
    (!comments || isLoading) ? (
      <View style={ loaderFullScreen ? styles.loaderCentered : styles.loader }>
        <Loader isLoading />
      </View>
    ) : (
      <View style={ [
        styles.noComments,
        loaderFullScreen && styles.noCommentsCentered,
      ] }
      >
        <ThemedText style={ styles.noCommentsText }>
          { t('No comments yet') }
        </ThemedText>
      </View>
    )
  ), [comments, isLoading, loaderFullScreen, styles]);

  const renderForm = (isFooter: boolean) => {
    if (!canPostComments) {
      return null;
    }

    const form = (
      <CommentForm
        isPosting={ isPosting }
        replyTo={ replyTo }
        styles={ styles }
        handleReply={ handleReply }
        handlePostComment={ handlePostComment }
      />
    );

    if (!isFooter) {
      return (
        <View style={ styles.formTop }>
          { form }
        </View>
      );
    }

    // The footer is a native sibling of the sheet's content view, so it is
    // outside the root the sheet sets up for its children - its own is what
    // makes the gesture-handler pressables inside react to touches.
    return (
      <View
        style={ [styles.formFooter, { paddingBottom: bottom + styles.formFooter.paddingTop }] }
        onLayout={ ({ nativeEvent }) => setFooterHeight(nativeEvent.layout.height) }
      >
        <GestureHandlerRootView>
          <Wrapper>
            { form }
          </Wrapper>
        </GestureHandlerRootView>
      </View>
    );
  };

  const renderList = () => (
    <ThemedGrid
      numberOfColumns={ 1 }
      style={ styles.list }
      data={ comments ?? [] }
      renderItem={ renderItem }
      onNextLoad={ onNextLoad }
      disableRefresh={ disableRefresh }
      ListEmptyComponent={ listEmptyComponent }
    />
  );

  // TrueSheet's footer floats at the bottom of the sheet itself rather than at
  // the bottom of the content view - which is sized to the largest detent - so
  // it is the one slot that keeps the composer on screen at a partly open
  // sheet, and it rises with the keyboard on its own. `keyboardOffset` tucks the
  // safe-area padding behind the keyboard so it does not double up.
  if (sheetRef) {
    return (
      <ThemedBottomSheet
        ref={ sheetRef }
        detents={ [...COMMENTS_SHEET_DETENTS] }
        scrollable
        // The sheet keeps its children unmounted until it presents, but this
        // component sits outside it now - without this the fetch would run as
        // soon as the film page mounted.
        onWillPresent={ handleStartLoad }
        footer={ renderForm(true) ?? undefined }
        footerOptions={ { keyboardOffset: -bottom } }
      >
        <Wrapper style={ [styles.sheetContent, { paddingBottom: footerHeight }] }>
          { /* pull-to-refresh would eat the downward drag the sheet needs to dismiss */ }
          { renderList() }
        </Wrapper>
      </ThemedBottomSheet>
    );
  }

  // No sheet to pin it to, so the composer goes above the list: this is the
  // player's full-height side panel, where the keyboard covers the bottom half.
  return (
    <View style={ [styles.wrapper, style] }>
      { renderForm(false) }
      { renderList() }
    </View>
  );
};

export default CommentsComponent;
