import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  container: {
    backgroundColor: Colors.background,
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    marginHorizontal: 16,
  },
  title: {
    fontSize: 48,
    fontWeight: '300',
    paddingBottom: 16,
  },
  subtitle: {
    fontSize: 32,
    fontWeight: '800',
  },
  error: {
    paddingVertical: 16,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    padding: 16,
    width: 200,
  },
});
