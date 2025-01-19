import Colors from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  loader: {},
  fullscreenLoader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
    backgroundColor: Colors.transparent,
  },
});
