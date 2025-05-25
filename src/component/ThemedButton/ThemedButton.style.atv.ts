import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  container: {
    backgroundColor: Colors.button,
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
    backgroundColor: Colors.buttonFocused,
  },
  textFilled: {
    color: Colors.text,
  },
  textFilledSelected: {
    color: Colors.textOnPrimary,
  },
  textFilledFocused: {
    color: Colors.textFocused,
  },
  iconFilled: {
    color: Colors.text,
  },
  iconFilledSelected: {},
  iconFilledFocused: {
    color: Colors.textFocused,
  },
  // outlined
  containerOutlined: {
    backgroundColor: Colors.transparent,
  },
  containerOutlinedSelected: {
    backgroundColor: Colors.tertiary,
  },
  containerOutlinedFocused: {
    backgroundColor: Colors.backgroundFocused,
  },
  textOutlined: {
    color: Colors.text,
  },
  textOutlinedSelected: {
    color: Colors.textOnTertiary,
  },
  textOutlinedFocused: {
    color: Colors.textFocused,
  },
  iconOutlined: {
    color: Colors.text,
  },
  iconOutlinedSelected: {
    color: Colors.textOnTertiary,
  },
  iconOutlinedFocused: {
    color: Colors.textFocused,
  },
  rightIcon: {
  },
});
