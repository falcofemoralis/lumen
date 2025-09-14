import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  container: {
    backgroundColor: Colors.button,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 0,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  text: {
    fontSize: 14,
  },
  // filled
  containerFilled: {
    borderRadius: 44,
  },
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
    borderRadius: 44,
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
