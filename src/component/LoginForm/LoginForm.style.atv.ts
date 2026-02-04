import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale }: Theme) => ({
  container: {
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignSelf: 'center',
    maxWidth: '50%',
  },
  form: {
    marginTop: scale(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    margin: scale(8),
  },
  input: {
    width: scale(250),
  },
  button: {
    margin: scale(8),
  },
} satisfies ThemedStyles);
