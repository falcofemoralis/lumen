import { useMemo } from 'react';
import { useMMKVString } from 'react-native-mmkv';
import { LocalCommentInterface } from 'Type/LocalComment.interface';
import { LOCAL_COMMENTS_KEY, parseCommentsList } from 'Util/LocalComments';
import { storage } from 'Util/Storage';

/**
 * Reactive view of the comments posted from this device, newest first.
 * Re-renders the consumer on any write, so a comment posted while the screen is
 * mounted shows up without a refresh.
 */
export const useLocalComments = (): LocalCommentInterface[] => {
  const [raw] = useMMKVString(LOCAL_COMMENTS_KEY, storage.getCommentsStorage().getMMKVInstance());

  return useMemo(() => parseCommentsList(raw), [raw]);
};
