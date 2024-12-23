import Colors from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const ROW_GAP = 16;

export const styles = CreateStyles({
  container: {
    backgroundColor: Colors.background,
  },
  rowStyle: {
    gap: ROW_GAP,
    flex: 1,
    backgroundColor: Colors.background,
  },
});
