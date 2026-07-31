import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale }: Theme) => ({
  container: {
    padding: scale(20),
    flex: 1,
    justifyContent: 'center',
    gap: scale(16),
  },
  form: {
    marginTop: scale(16),
    gap: scale(8),
  },
  input: {
    margin: scale(4),
  },
  action: {
  },
} satisfies ThemedStyles);
