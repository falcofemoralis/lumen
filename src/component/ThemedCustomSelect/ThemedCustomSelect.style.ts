import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors }: Theme) => ({
  input: {
    backgroundColor: colors.backgroundLighter,
  },
  inputContent: {
    justifyContent: 'flex-start',
    gap: scale(8),
    padding: scale(8),
  },
  overlay: {
    padding: scale(8),
  },
  overlayContent: {
    width: '100%',
    flexDirection: 'row',
  },
  modalView: {
    width: '100%',
    flexDirection: 'column',
    gap: scale(12),
  },
} satisfies ThemedStyles);
