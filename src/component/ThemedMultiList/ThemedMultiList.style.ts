import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale }: Theme) => ({
  // The button lays its content out from the start, so the checkbox has to push
  // itself to the trailing edge of the row.
  checkbox: {
    marginLeft: 'auto',
  },
  emptyBlock: {
    minHeight: scale(120),
    justifyContent: 'center',
    alignItems: 'center',
  },
} satisfies ThemedStyles);
