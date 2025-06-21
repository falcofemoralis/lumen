import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const MAIN_CONTENT_HEIGHT_TV = 300;

export const styles = CreateStyles({
  mainContent: {
    flexDirection: 'row',
    gap: 24,
    width: '100%',
    paddingBottom: 8,
  },
  photo: {
    width: '15%',
    aspectRatio: '12 / 19',
    borderRadius: 16,
  },
  name: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
    color: Colors.text,
  },
  originalName: {
    fontSize: 16,
    lineHeight: 16,
    color: Colors.textSecondary,
    opacity: 0.6,
    marginTop: 4,
  },
  text: {
    fontSize: 14,
  },
  additionalInfo: {
    flexDirection: 'column',
    gap: 8,
    marginTop: 8,
  },
});
