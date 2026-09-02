import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  // The player is landscape, where the overlay defaults to a 300 wide box on the right.
  // This one holds a label and a value per row, so it is given the width that takes -
  // still off to one side, leaving the subtitles it styles in the clear.
  overlayContent: {
    width: '50%',
    maxWidth: scale(420),
    maxHeight: '90%',
  },
  container: {
    width: '100%',
    flexDirection: 'column',
    flexShrink: 1,
    gap: scale(8),
  },
  title: {
    fontSize: scale(text.lg.fontSize),
    fontWeight: '700',
  },
  settings: {
    width: '100%',
    gap: scale(8),
  },
  settingsContainer: {
    width: '100%',
    flexShrink: 1,
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
    backgroundColor: colors.backgroundLighter,
  },
  rowInputContent: {
    justifyContent: 'flex-start',
    padding: scale(8),
  },
  toggle: {
    flex: 1,
  },
  toggleInput: {
    width: '100%',
    justifyContent: 'flex-end',
  },
} satisfies ThemedStyles);
