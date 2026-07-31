import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, text, colors }: Theme) => ({
  actor: {
    width: scale(90),
    paddingBottom: scale(4),
  },
  actorFocused: {
    backgroundColor: colors.backgroundFocused,
    borderRadius: scale(12),
  },
  actorPhoto: {
    height: scale(130),
    borderRadius: scale(12),
  },
  actorName: {
    fontSize: scale(text.xxs.fontSize),
    textAlign: 'center',
    marginTop: scale(8),
  },
  actorNameFocused: {
    color: colors.textFocused,
  },
  actorJob: {
    fontSize: scale(text.xxs.fontSize),
    textAlign: 'center',
  },
  director: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    gap: scale(4),
    backgroundColor: colors.modal,
    alignItems: 'center',
    paddingInline: scale(4),
    width: '100%',
  },
  directorText: {
    fontSize: scale(text.xs.fontSize),
    lineHeight: scale(text.xs.lineHeight),
  },
} satisfies ThemedStyles);
