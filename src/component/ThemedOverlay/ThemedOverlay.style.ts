import Colors from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  modal: {
    paddingHorizontal: 8,
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
  contentContainerStyle: {
    backgroundColor: '#1E1F20',
    padding: 8,
    borderRadius: 16,
    borderColor: Colors.lightGravel,
    borderWidth: 1,
    maxHeight: '50%',
    overflow: 'hidden',
  },
  contentContainerStyleLandscape: {
    position: 'absolute',
    right: '10%',
    width: '100%',
    maxHeight: 300,
    maxWidth: 300,
  },
});
