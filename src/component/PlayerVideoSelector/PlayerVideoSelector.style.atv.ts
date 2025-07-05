import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  container: {
    maxHeight: 300,
  },
  voicesInput: {
    marginBottom: 10,
  },
  episodesContainer: {
    borderTopWidth: 2,
    borderTopColor: Colors.border,
    paddingTop: 8,
  },
  button: {
    marginEnd: 10,
    marginBottom: 10,
  },
  voicesWrapper: {
    width: '100%',
    minWidth: 288,
    maxHeight: 288,
    flexDirection: 'column',
    gap: 4,
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
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#0283d1',
    backgroundColor: 'transparent',
  },
  buttonProgressMask: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.button,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  buttonProgressMaskSelected: {
    backgroundColor: Colors.primary,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  buttonProgressMaskFocused: {
    backgroundColor: Colors.buttonFocused,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
});
