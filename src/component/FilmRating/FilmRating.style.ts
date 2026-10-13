import { Platform } from 'react-native';
import { Theme } from 'Theme/types';

export const componentStyles = ({ scale: baseScale, text }: Theme) => {
  const scale = (value: number) => baseScale(value * (Platform.OS === 'web' ? 1.3 : 1));
  return ({
  container: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    minWidth: scale(30),
    paddingHorizontal: scale(6),
    paddingVertical: scale(3),
    borderBottomRightRadius: scale(6),
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    zIndex: 20,
  },
  text: {
    fontSize: scale(text.xxs.fontSize * 0.7),
    fontWeight: '700' as const,
    textAlign: 'center' as const,
    lineHeight: scale(text.xxs.fontSize * 0.7 + 2),
  },
});
};
