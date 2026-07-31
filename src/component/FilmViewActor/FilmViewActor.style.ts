import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, text, colors }: Theme) => ({
  actor: {
    width: scale(90),
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
    fontSize: scale(text.xxs.fontSize),
    color: colors.textOnContrast,
  },
} satisfies ThemedStyles);
