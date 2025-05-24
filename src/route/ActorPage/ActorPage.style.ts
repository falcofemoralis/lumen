import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  grid: {
    height: '100%',
    width: '100%',
  },
  mainContent: {
    flexDirection: 'row',
    gap: 24,
    width: '100%',
    paddingBottom: 16,
  },
  photoWrapper: {
    width: '30%',
    aspectRatio: '12 / 19',
    borderRadius: 16,
  },
  photo: {
    height: '100%',
    width: '100%',
    borderRadius: 16,
  },
  name: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
    color: Colors.white,
  },
  originalName: {
    fontSize: 16,
    lineHeight: 16,
    color: Colors.lightGray,
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
