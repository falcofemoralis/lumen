import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  switchDetail: {
    borderRadius: scale(12),
    position: 'absolute',
    width: scale(24),
    height: scale(24),
  },
  toggleInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  switchInner: {
    borderColor: colors.transparent,
    position: 'absolute',
    paddingStart: scale(4),
    paddingEnd: scale(4),
  },
  inputOuter: {
    alignItems: 'center',
    overflow: 'hidden',
    flexGrow: 0,
    flexShrink: 0,
    justifyContent: 'space-between',
    flexDirection: 'row',
    height: scale(34),
    width: scale(58),
    borderRadius: scale(16),
    borderWidth: scale(2),
  },
  inputOuterFocused: {
    borderColor: colors.icon,
  },
  inputWrapper: {
    alignItems: 'center',
  },
} satisfies ThemedStyles);