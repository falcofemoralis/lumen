import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors }: Theme) => ({
  createContainer: {
    padding: scale(8),
    flexDirection: 'column',
    gap: scale(12),
  },
  input: {
    width: '100%',
  },
  actions: {
    width: '100%',
    flexDirection: 'row',
    gap: scale(8),
    justifyContent: 'flex-end',
    paddingTop: scale(8),
  },
  button: {
    flex: 0,
    paddingInline: scale(20),
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
} satisfies ThemedStyles);
