import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors }: Theme) => ({
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: scale(8),
    paddingRight: scale(64),
    justifyContent: 'center',
    alignItems: 'flex-end',
    zIndex: 1000,
  },
  backdrop: {
    backgroundColor: colors.modal,
  },
  contentContainerStyle: {
    backgroundColor: colors.backgroundLight,
    padding: scale(8),
    borderRadius: scale(16),
    borderColor: colors.darkBorder,
    borderWidth: 1,
    maxHeight: '50%',
    overflow: 'hidden',
  },
} satisfies ThemedStyles);
