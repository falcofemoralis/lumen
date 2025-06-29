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
});
