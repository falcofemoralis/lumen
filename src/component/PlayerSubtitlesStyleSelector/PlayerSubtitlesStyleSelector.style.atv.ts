import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, text }: Theme) => ({
  // wider than the CDN selector's: every row carries a label and the value picked for
  // it, and the value labels ("Translucent black") are the long ones
  overlayContent: {
    width: '45%',
    maxHeight: '90%',
    flexDirection: 'row',
  },
  container: {
    width: '100%',
    flexDirection: 'column',
    gap: scale(12),
  },
  title: {
    fontSize: scale(text.lg.fontSize),
    fontWeight: '700',
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  rowLabel: {
    flex: 1,
  },
  // what the switch being off looks like, the same dimming a disabled setting gets on
  // the settings screen
  rowDisabled: {
    opacity: 0.5,
  },
  rowInput: {
    flex: 1,
  },
  rowInputContent: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  toggle: {
    flex: 1,
  },
  toggleInput: {
    width: '100%',
    justifyContent: 'flex-end',
  },
} satisfies ThemedStyles);
