import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  container: {
    paddingHorizontal: scale(20),
    paddingBottom: scale(24),
  },
  item: {
    minHeight: scale(60),
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemContent: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  itemIcon: {
    flexShrink: 0,
    width: scale(24),
    height: scale(24),
    color: colors.textSecondary,
  },
  label: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
    color: colors.text,
    fontSize: scale(text.sm.fontSize),
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: scale(4),
  },
  button: {
    width: scale(40),
    height: scale(40),
  },
  buttonContent: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    flexShrink: 0,
    width: scale(24),
    height: scale(24),
    color: colors.text,
  },
} satisfies ThemedStyles);