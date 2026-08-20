import { useNavigation } from '@react-navigation/native';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { useConfigContext } from 'Context/ConfigContext';
import { useLocalComments } from 'Hooks/useLocalComments';
import { getCurrentLanguage } from 'i18n/index';
import { useCallback, useMemo, useRef } from 'react';
import { removeLocalComment } from 'Util/LocalComments';
import { parseCommentTags } from 'Util/LocalComments/tags';
import { openFilm } from 'Util/Router';

import MyCommentsScreenComponent from './MyCommentsScreen.component';
import MyCommentsScreenComponentTV from './MyCommentsScreen.component.atv';
import { MyCommentItem } from './MyCommentsScreen.type';

export function MyCommentsScreenContainer() {
  const { isTV } = useConfigContext();
  const navigation = useNavigation();
  const comments = useLocalComments();
  const forgetConfirmOverlayRef = useRef<ThemedOverlayRef | null>(null);
  const forgetCommentRef = useRef<MyCommentItem | null>(null);

  const items = useMemo((): MyCommentItem[] => {
    const locale = getCurrentLanguage();

    // Several comments a day on the same film are the common case, so the time
    // is what tells two rows apart -- the date alone would not.
    return comments.map((comment) => ({
      ...comment,
      segments: parseCommentTags(comment.text),
      date: new Date(comment.createdAt).toLocaleString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    }));
  }, [comments]);

  const handleOnPress = useCallback((item: MyCommentItem) => {
    openFilm({ link: item.link, poster: item.poster }, navigation);
  }, [navigation]);

  const openForgetConfirmOverlay = useCallback((item: MyCommentItem) => {
    forgetCommentRef.current = item;
    forgetConfirmOverlayRef.current?.open();
  }, []);

  const forgetComment = useCallback(() => {
    const item = forgetCommentRef.current;
    forgetCommentRef.current = null;

    forgetConfirmOverlayRef.current?.close();

    if (!item) {
      return;
    }

    // the reactive local comments hook refreshes the list
    removeLocalComment(item.id);
  }, []);

  const containerProps = {
    items,
    forgetConfirmOverlayRef,
    handleOnPress,
    openForgetConfirmOverlay,
    forgetComment,
  };

  // eslint-disable-next-line max-len
  return isTV ? <MyCommentsScreenComponentTV { ...containerProps } /> : <MyCommentsScreenComponent { ...containerProps } />;
}

export default MyCommentsScreenContainer;
