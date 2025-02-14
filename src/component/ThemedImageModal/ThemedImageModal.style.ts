import Colors from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  modal: {
    backgroundColor: Colors.transparent,
  },
  modalContentContainer: {
    width: '100%',
    height: '100%',
    maxWidth: '100%',
    maxHeight: '100%',
    backgroundColor: Colors.transparent,
    borderColor: Colors.transparent,
    borderWidth: 0,
    padding: 0,
    borderRadius: 0,
    shadowColor: Colors.transparent,
  },
});
