import { useCallback, useRef, useState } from 'react';
import { NativeSyntheticEvent, TextInputSelectionChangeEventData } from 'react-native';

import { CommentTag } from './Comments.config';

type Selection = { start: number; end: number };

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/**
 * The composer's text plus the caret bookkeeping the formatting actions need.
 *
 * The selection is tracked in a ref rather than state - it changes on every
 * keystroke and nothing renders from it. `selection` is only handed to the
 * TextInput for the one render that follows a tag insertion, to place the caret;
 * leaving it controlled after that fights the caret while the user types, so the
 * next selection event releases it again.
 */
export const useCommentText = () => {
  const [text, setText] = useState('');
  const [selection, setSelection] = useState<Selection | undefined>(undefined);
  const selectionRef = useRef<Selection>({ start: 0, end: 0 });

  const onSelectionChange = useCallback((event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
    selectionRef.current = event.nativeEvent.selection;

    setSelection(undefined);
  }, []);

  const onChangeText = useCallback((value: string) => {
    setText(value);
  }, []);

  const resetText = useCallback(() => {
    selectionRef.current = { start: 0, end: 0 };

    setText('');
    setSelection(undefined);
  }, []);

  /**
   * Wraps the selection in `[tag]...[/tag]`. With nothing selected the pair is
   * inserted empty at the caret and the caret lands between the two, so the user
   * can just carry on typing inside it.
   */
  const applyTag = useCallback((tag: CommentTag) => {
    const open = `[${tag}]`;
    const close = `[/${tag}]`;

    const start = clamp(selectionRef.current.start, 0, text.length);
    const end = clamp(selectionRef.current.end, start, text.length);

    const caret = start === end
      ? start + open.length
      : end + open.length + close.length;

    selectionRef.current = { start: caret, end: caret };

    setText(`${text.slice(0, start)}${open}${text.slice(start, end)}${close}${text.slice(end)}`);
    setSelection({ start: caret, end: caret });
  }, [text]);

  return {
    text,
    selection,
    onChangeText,
    onSelectionChange,
    applyTag,
    resetText,
  };
};

export default useCommentText;
