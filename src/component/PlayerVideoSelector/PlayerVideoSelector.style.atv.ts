import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  container: {
    maxHeight: scale(300),
  },
  voicesInput: {
    marginBottom: scale(10),
  },
  episodesContainer: {
    borderTopWidth: scale(2),
    borderTopColor: colors.border,
    paddingTop: scale(8),
  },
  episodesContainerNoBorder: {
    borderTopWidth: 0,
  },
  button: {
    marginEnd: scale(10),
    marginBottom: scale(10),
  },
  voicesWrapper: {
    width: '100%',
    minWidth: scale(288),
    maxHeight: scale(288),
    flexDirection: 'column',
    gap: scale(4),
  },
  voicesContainer: {
    flex: 1,
  },
  buttonProgressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  buttonProgressOutline: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: scale(18),
    borderWidth: scale(2),
    borderColor: '#0283d1',
    backgroundColor: colors.transparent,
  },
  buttonProgressMask: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.button,
  },
  buttonProgressMaskSelected: {
    backgroundColor: colors.primary,
  },
  buttonProgressMaskFocused: {
    backgroundColor: colors.buttonFocused,
  },
} satisfies ThemedStyles);
