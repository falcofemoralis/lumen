import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale }: Theme) => ({
  // The button lays its content out from the start, so the checkbox has to push
  // itself to the trailing edge of the row.
  checkbox: {
    marginLeft: 'auto',
  },
  // No `flex: 1` here: the list wrapper has no height of its own while the list
  // is empty, and a flex child (flex-basis 0) would leave that wrapper measuring
  // zero -- the block would be laid out, then clipped away by its overflow.
  emptyBlock: {
    justifyContent: 'center',
    paddingVertical: scale(24),
  },
} satisfies ThemedStyles);
