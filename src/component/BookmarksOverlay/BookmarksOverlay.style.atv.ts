import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors }: Theme) => ({
  // ThemedSimpleList already sizes itself to a whole number of rows that fits the
  // screen, so the overlay must not add a cap of its own (it defaults to 50% of
  // the screen, which clipped the last row).
  overlayContent: {
    maxHeight: '100%',
    // Without a width of its own the panel is auto-sized by its widest child,
    // and the `width: '100%'` rows below resolve their percentage against the
    // whole modal area instead -- stretching it across the screen.
    //
    // The value is the list's: ThemedSimpleList draws its rows scale(300) wide
    // minus its own scale(12) bleed padding each side, and that row width is the
    // one thing here that cannot stretch. Anything wider leaves the rows short of
    // the right edge, since their wrapper is pulled flush left by its negative
    // margins. 276 rows + scale(8) overlay padding each side:
    width: scale(292),
  },
  createContainer: {
    padding: scale(8),
    flexDirection: 'column',
    gap: scale(12),
  },
  input: {
    width: '100%',
  },
  actions: {
    width: '100%',
    flexDirection: 'row',
    gap: scale(8),
    justifyContent: 'flex-end',
    paddingTop: scale(8),
  },
  button: {
    flex: 0,
    paddingInline: scale(20),
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
} satisfies ThemedStyles);
