import { ThemedInput } from 'Component/ThemedInput';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { t } from 'i18n/translate';
import SendHorizontal from 'lucide-react-native/icons/send-horizontal';
import X from 'lucide-react-native/icons/x';
import { useCallback } from 'react';
import { View } from 'react-native';
import { useAppTheme } from 'Theme/context';
import { ThemedStyles } from 'Theme/types';
import { CommentInterface } from 'Type/Comment.interface';

import { COMMENT_MAX_LENGTH, COMMENT_TAGS } from './Comments.config';
import { componentStyles } from './Comments.style';
import { useCommentText } from './useCommentText';

export interface CommentFormProps {
  isPosting: boolean;
  replyTo: CommentInterface | null;
  styles: ThemedStyles<typeof componentStyles>;
  handleReply: (comment: CommentInterface | null) => void;
  handlePostComment: (text: string, replyToId?: string) => Promise<void>;
}

export const CommentForm = ({
  isPosting,
  replyTo,
  styles,
  handleReply,
  handlePostComment,
}: CommentFormProps) => {
  const { scale, theme } = useAppTheme();
  const {
    text,
    selection,
    onChangeText,
    onSelectionChange,
    applyTag,
    resetText,
  } = useCommentText();

  const canSend = !isPosting && text.trim().length > 0;

  const onSend = useCallback(async () => {
    try {
      await handlePostComment(text, replyTo?.id);

      resetText();
    } catch {
      // the container reports the failure - the typed text stays for a retry
    }
  }, [handlePostComment, replyTo, resetText, text]);

  const renderReplyBadge = () => {
    if (!replyTo) {
      return null;
    }

    return (
      <View style={ styles.formReply }>
        <ThemedText
          style={ styles.formReplyText }
          numberOfLines={ 1 }
        >
          { t('Reply to {{username}}', { username: replyTo.username }) }
        </ThemedText>
        <ThemedPressable
          contentStyle={ styles.formReplyClose }
          onPress={ () => handleReply(null) }
        >
          <X
            size={ scale(16) }
            color={ theme.colors.icon }
          />
        </ThemedPressable>
      </View>
    );
  };

  // Always up rather than only while a range is selected: with a selection the
  // action wraps it, and with a bare caret it drops an empty pair to type into.
  const renderToolbar = () => (
    <View style={ styles.formToolbar }>
      { COMMENT_TAGS.map(({ tag, IconComponent }) => (
        <ThemedPressable
          key={ tag }
          contentStyle={ styles.formToolbarBtn }
          disabled={ isPosting }
          onPress={ () => applyTag(tag) }
        >
          <IconComponent
            size={ scale(16) }
            color={ theme.colors.icon }
          />
        </ThemedPressable>
      )) }
    </View>
  );

  return (
    <View style={ styles.form }>
      { renderReplyBadge() }
      <View style={ styles.formRow }>
        <ThemedInput
          containerStyle={ styles.formInputContainer }
          style={ styles.formInput }
          placeholder={ replyTo ? t('Write a reply') : t('Write a comment') }
          value={ text }
          selection={ selection }
          onChangeText={ onChangeText }
          onSelectionChange={ onSelectionChange }
          maxLength={ COMMENT_MAX_LENGTH }
          editable={ !isPosting }
          multiline
        />
        <ThemedPressable
          contentStyle={ styles.formSend }
          disabled={ !canSend }
          onPress={ onSend }
        >
          <SendHorizontal
            size={ scale(20) }
            color={ theme.colors.icon }
            opacity={ canSend ? 1 : 0.8 }
          />
        </ThemedPressable>
      </View>
      { renderToolbar() }
    </View>
  );
};

export default CommentForm;
