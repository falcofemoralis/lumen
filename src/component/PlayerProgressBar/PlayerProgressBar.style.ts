import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  view: {
    alignItems: 'center',
  },
  bubbleStyle: {
    padding: scale(2),
    paddingHorizontal: scale(5),
    borderRadius: scale(5),
    backgroundColor: colors.secondary,
  },
  textStyle: {
    color: colors.text,
    fontSize: scale(text.xxs.fontSize),
    paddingVertical: 0,
  },
  storyBoard: {
    position: 'absolute',
    bottom: scale(25),
    alignSelf: 'center',
  },
} satisfies ThemedStyles);
