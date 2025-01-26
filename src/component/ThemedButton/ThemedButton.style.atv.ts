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
    alignItems: 'center',
  },
  // filled
  containerFilled: {},
  containerFilledSelected: {
    backgroundColor: Colors.primary,
  },
  containerFilledFocused: {
    backgroundColor: Colors.white,
  },
  textFilled: {
    color: Colors.white,
  },
  textFilledSelected: {
    color: Colors.lightBlue,
  },
  textFilledFocused: {
    color: Colors.black,
  },
  iconFilled: {
    color: Colors.white,
  },
  iconFilledSelected: {},
  iconFilledFocused: {
    color: Colors.black,
  },
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
  rightIcon: {
  },
});
