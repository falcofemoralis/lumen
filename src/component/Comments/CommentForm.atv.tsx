import { ThemedButton } from 'Component/ThemedButton';
import { ThemedInput } from 'Component/ThemedInput';
import { t } from 'i18n/translate';
import SendHorizontal from 'lucide-react-native/icons/send-horizontal';
import { useCallback } from 'react';
import { View } from 'react-native';
import { ThemedStyles } from 'Theme/types';
import { CommentInterface } from 'Type/Comment.interface';

import { COMMENT_MAX_LENGTH, COMMENT_TAGS, getCommentId } from './Comments.config';
import { componentStyles } from './Comments.style.atv';
import { useCommentText } from './useCommentText';

export interface CommentFormProps {
  isPosting: boolean;
  /** `null` posts a new root comment */
  replyTo: CommentInterface | null;
  styles: ThemedStyles<typeof componentStyles>;
  autofocus?: boolean;
  handlePostComment: (text: string, replyToId?: string) => Promise<void>;
  onPosted?: () => void;
}

export const CommentForm = ({
  isPosting,
  replyTo,
  styles,
  autofocus,
  handlePostComment,
  onPosted,
}: CommentFormProps) => {
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
      await handlePostComment(text, replyTo ? getCommentId(replyTo) : undefined);

      resetText();
      onPosted?.();
    } catch {
      // the container reports the failure - the typed text stays for a retry
    }
  }, [handlePostComment, onPosted, replyTo, resetText, text]);

  // A remote cannot realistically select a range, so these mostly drop an empty
  // tag pair at the caret for the user to type into - which is why they sit on
  // their own row under the input rather than competing with Send for its width.
  const renderToolbar = () => (
    <View style={ styles.formToolbar }>
      { COMMENT_TAGS.map(({ tag, IconComponent }) => (
        <ThemedButton
          key={ tag }
          IconComponent={ IconComponent }
          style={ styles.formToolbarBtn }
          disabled={ isPosting }
          onPress={ () => applyTag(tag) }
        />
      )) }
    </View>
  );

  return (
    <View style={ styles.formWrapper }>
      <View style={ styles.form }>
        <View style={ styles.formInputContainer }>
          <ThemedInput
            style={ styles.formInput }
            placeholder={ replyTo ? t('Write a reply') : t('Write a comment') }
            value={ text }
            selection={ selection }
            onChangeText={ onChangeText }
            onSelectionChange={ onSelectionChange }
            maxLength={ COMMENT_MAX_LENGTH }
            editable={ !isPosting }
            autofocus={ autofocus }
          />
        </View>
        <ThemedButton
          title={ t('Send') }
          IconComponent={ SendHorizontal }
          disabled={ !canSend }
          onPress={ onSend }
        />
      </View>
      { renderToolbar() }
    </View>
  );
};

export default CommentForm;
