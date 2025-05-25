import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  modal: {
    position: 'absolute',
    top: 0,
    width: '100%',
    bottom: 0,
    justifyContent: 'center',
    backgroundColor: Colors.modal,
    zIndex: 1000,
    opacity: 0,
  },
  modalVisible: {
    opacity: 1,
  },
  container: {
    minHeight: 100,
    minWidth: 100,
    width: 'auto',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 16,
    borderColor: Colors.darkBorder,
    borderWidth: 1,
    padding: 12,
    alignSelf: 'flex-end',
    marginRight: 64,
  },
  contentContainer: {
  },
});
