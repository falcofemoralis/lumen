import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  loadingContainer: {
    opacity: 0.5,
    pointerEvents: 'none',
  },
  overlay: {
    width: '40%',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
  },
  headerIcon: {
    height: 32,
    width: 32,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  closeIcon: {
    height: 16,
    width: 16,
  },
  closeBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderRadius: 50,
  },
  closeBtnContent: {
    padding: 8,
  },
  updateText: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 16,
  },
  versionText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  newText: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 16,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 16,
  },
  buttonContainer: {
    flex: 1,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButton: {
  },
  updateButton: {
    backgroundColor: Colors.secondary,
  },
});