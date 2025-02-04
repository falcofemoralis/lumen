import Colors from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  view: {
    alignItems: 'center',
  },
  bubbleStyle: {
    padding: 2,
    paddingHorizontal: 5,
    borderRadius: 5,
    backgroundColor: Colors.secondary,
  },
  textStyle: {
    color: Colors.white,
    fontSize: 12,
    paddingVertical: 0,
  },
  storyBoard: {
    position: 'absolute',
    bottom: 25,
    alignSelf: 'center',
  },
});
