import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale }: Theme) => ({
  container: {
    position: 'absolute',
    left: '50%',
    bottom: scale(25),
    width: '70%',
    transform: [{ translateX: '-50%' }],
  },
  text: {
    fontSize: scale(25),
    color: 'white',
    textAlign: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    padding: scale(25),
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2,
  },
} satisfies ThemedStyles);
