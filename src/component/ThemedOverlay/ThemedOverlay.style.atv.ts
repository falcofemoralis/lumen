import { Theme, ThemedStyles } from 'Theme/types';

export const ANIMATION_DURATION = 250;

export const componentStyles = ({ scale, colors }: Theme) => ({
  modal: {
    position: 'absolute',
    top: 0,
    width: '100%',
    bottom: 0,
    justifyContent: 'center',
    backgroundColor: colors.modal,
    zIndex: 1000,
    opacity: 0,
    transitionProperty: 'opacity',
    transitionDuration: `${ANIMATION_DURATION}ms`,
    transitionTimingFunction: 'ease-in-out',
  },
  modalVisible: {
    opacity: 1,
  },
  container: {
    flex: 0,
    minHeight: scale(100),
    minWidth: scale(100),
    width: 'auto',
    backgroundColor: colors.backgroundLight,
    borderRadius: scale(16),
    borderColor: colors.darkBorder,
    borderWidth: 1,
    padding: scale(12),
    alignSelf: 'flex-end',
    marginRight: scale(64),
  },
  contentContainer: {
  },
} satisfies ThemedStyles);
