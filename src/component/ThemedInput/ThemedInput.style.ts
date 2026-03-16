import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors }: Theme) => ({
  container: {
    backgroundColor: colors.input,
    borderRadius: scale(16),
    paddingHorizontal: scale(8),
  },
  input: {
    color: colors.text,
  },
  secureIcon: {
    width: scale(32),
    height: scale(32),
    position: 'absolute',
    right: scale(4),
    top: '50%',
    transform: [{ translateY: -scale(16) }],
    borderRadius: scale(50),
  },
} satisfies ThemedStyles);
