import Colors from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  container: {
    minWidth: '30%',
    maxWidth: '40%',
  },
  voicesInput: {
    marginBottom: 10,
  },
  episodesContainer: {
    flexWrap: 'wrap',
    borderTopWidth: 2,
    borderTopColor: Colors.lightGravel,
    paddingTop: 8,
  },
  button: {
    marginEnd: 10,
    marginBottom: 10,
  },
  play: {
    flexDirection: 'row',
    borderTopWidth: 2,
    borderTopColor: Colors.lightGravel,
    paddingTop: 8,
  },
});
