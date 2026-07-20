import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  overlay: {},
  container: {
    padding: scale(8),
    flexDirection: 'column',
    gap: scale(16),
  },
  title: {
    fontSize: scale(text.lg.fontSize),
    fontWeight: '700',
  },
  list: {
    maxHeight: scale(240),
  },
  emptyText: {
    fontSize: scale(text.sm.fontSize),
    opacity: 0.7,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
    paddingVertical: scale(4),
  },
  rowTitle: {
    flex: 1,
    fontSize: scale(text.md.fontSize),
  },
  rowCount: {
    fontSize: scale(text.sm.fontSize),
    opacity: 0.7,
  },
  rowDelete: {
    width: scale(32),
    height: scale(32),
  },
  rowDeleteContent: {
    padding: 0,
  },
  input: {
    width: '100%',
  },
  confirmTitle: {
    fontSize: scale(text.md.fontSize),
    fontWeight: '700',
  },
  confirmMessage: {
    fontSize: scale(text.sm.fontSize),
  },
  actions: {
    width: '100%',
    flexDirection: 'row',
    gap: scale(8),
    justifyContent: 'flex-end',
  },
  button: {
    flex: 0,
    paddingInline: scale(20),
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
} satisfies ThemedStyles);
