import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale }: Theme) => ({
  container: {
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: scale(16),
  },
  form: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(16),
  },
  inputContainer: {
    flexDirection: 'row',
  },
  input: {
  },
  button: {
    width: '100%',
    margin: scale(8),
  },
  overlay: {
    maxWidth: '50%',
  },
} satisfies ThemedStyles);
