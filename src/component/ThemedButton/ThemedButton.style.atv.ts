import Colors from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  container: {
    backgroundColor: Colors.gray,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 44,
    flexDirection: 'row',
    gap: 6,
  },
  containerSelected: {
    backgroundColor: Colors.white,
  },
  containerFocused: {
    backgroundColor: Colors.darkBlue,
  },
  text: {
    color: Colors.white,
  },
  textSelected: {
    color: Colors.black,
  },
  textFocused: {
    color: Colors.darkGray,
  },
  icon: {
    color: Colors.white,
  },
  iconSelected: {},
  iconFocused: {},
  // outlined
  containerOutlined: {
    backgroundColor: Colors.transparent,
  },
  containerOutlinedSelected: {
    backgroundColor: Colors.darkBlue,
  },
  containerOutlinedFocused: {
    backgroundColor: Colors.white,
  },
  textOutlined: {
    color: Colors.white,
  },
  textOutlinedSelected: {
    color: Colors.lightBlue,
  },
  textOutlinedFocused: {
    color: Colors.black,
  },
  iconOutlined: {
    color: Colors.white,
  },
  iconOutlinedSelected: {
    color: Colors.lightBlue,
  },
  iconOutlinedFocused: {
    color: Colors.black,
  },
});
