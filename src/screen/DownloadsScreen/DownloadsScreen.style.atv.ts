import { Theme, ThemedStyles } from 'Theme/types';

const ROW_GAP = 24;

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  grid: {
    padding: scale(ROW_GAP),
    marginLeft: scale(ROW_GAP),
    marginRight: scale(ROW_GAP),
  },
  rowStyle: {
    flexDirection: 'row',
    width: '100%',
    gap: scale(8),
    paddingBlock: scale(8),
    paddingHorizontal: scale(8),
  },
  card: {
    width: '100%',
    flexDirection: 'row',
    gap: scale(12),
    padding: scale(6),
  },
  item: {
    width: '100%',
    height: 250,
    flexDirection: 'row',
    gap: scale(8),
    opacity: 0.7,
    transform: [{ scale: 1 }],
    transitionProperty: 'all',
    transitionDuration: '250ms',
  },
  itemFocused: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  posterContainer: {
    borderRadius: 8,
    borderWidth: scale(2),
    borderColor: colors.transparent,
    overflow: 'hidden',
  },
  posterContainerFocused: {
    borderWidth: scale(2),
    borderColor: colors.icon,
  },
  poster: {
    height: scale(150),
    width: 'auto',
    aspectRatio: '166 / 250',
  },
  cardContent: {
    flexDirection: 'column',
    flex: 1,
    gap: scale(6),
  },
  title: {
    fontWeight: 'bold',
    fontSize: scale(text.sm.fontSize),
  },
  actionsBtn: {
    backgroundColor: colors.transparent,
  },
  iconFocused: {
    backgroundColor: colors.icon,
  },
  taskContainer: {
    width: '100%',
    height: 'auto',
    flexDirection: 'column',
    marginTop: scale(4),
  },
  taskContent: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskActions: {
    flexDirection: 'row',
  },
  progressBar: {
    pointerEvents: 'none',
    marginTop: scale(12),
  },
  error: {
    color: colors.error,
  },
  overlayActions: {
    width: '100%',
    flexDirection: 'row',
  },
  empty: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskRow: {
    flexDirection: 'row',
  },
  taskRowContent: {
    flexDirection: 'row',
    gap: scale(8),
    padding: scale(10),
    borderRadius: scale(50),
    backgroundColor: colors.transparent,
    transitionProperty: 'backgroundColor',
    transitionDuration: '250ms',
  },
  taskRowContentFocused: {
    backgroundColor: colors.icon,
  },
  taskRowTextFocused: {
    color: colors.textFocused,
  },
  tasksOverlay: {
    width: '60%',
  },
  refreshBtn: {
    marginTop: scale(16),
  },
} as ThemedStyles);