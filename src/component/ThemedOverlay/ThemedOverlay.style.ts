import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors }: Theme) => ({
  modal: {
    paddingHorizontal: scale(8),
    justifyContent: 'center',
    height: '100%',
    width: '100%',
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
  contentContainerStyleLandscape: {
    position: 'absolute',
    right: '10%',
    width: '100%',
    maxHeight: scale(300),
    maxWidth: scale(300),
  },
} satisfies ThemedStyles);
