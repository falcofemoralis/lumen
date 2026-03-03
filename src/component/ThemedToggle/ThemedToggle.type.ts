import { FC } from 'react';
import {
  ImageStyle,
  StyleProp,
  SwitchProps,
  TextInputProps,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';

export interface ToggleProps<T> extends Omit<TouchableOpacityProps, 'style'> {
  /**
   * A style modifier for different input states.
   */
  status?: 'error' | 'disabled'
  /**
   * If false, input is not editable. The default value is true.
   */
  editable?: TextInputProps['editable']
  /**
   * The value of the field. If true the component will be turned on.
   */
  value?: boolean
  /**
   * Invoked with the new value when the value changes.
   */
  onValueChange?: SwitchProps['onValueChange']
  /**
   * Style overrides for the container
   */
  containerStyle?: StyleProp<ViewStyle>
  /**
   * Style overrides for the input wrapper
   */
  inputWrapperStyle?: StyleProp<ViewStyle>
  /**
   * Optional input wrapper style override.
   * This gives the inputs their size, shape, "off" background-color, and outer border.
   */
  inputOuterStyle?: ViewStyle
  /**
   * Optional input style override.
   * This gives the inputs their inner characteristics and "on" background-color.
   */
  inputInnerStyle?: ViewStyle
  /**
   * Optional detail style override.
   * See Checkbox, Radio, and Switch for more details
   */
  inputDetailStyle?: ViewStyle
  /**
   * The input control for the type of toggle component
   */
  ToggleInput: FC<BaseToggleInputProps<T>>
}

export interface BaseToggleInputProps<T> {
  on: boolean
  status: ToggleProps<T>['status']
  disabled: boolean
  outerStyle: ViewStyle
  innerStyle: ViewStyle
  detailStyle: ViewStyle | ImageStyle
  isFocused?: boolean
}

export interface SwitchInputProps extends BaseToggleInputProps<SwitchToggleProps> {
}

export interface SwitchToggleProps extends Omit<ToggleProps<SwitchInputProps>, 'ToggleInput'> {
  /**
   * Optional style prop that affects the knob View.
   * Note: `width` and `height` rules should be points (numbers), not percentages.
   */
  inputDetailStyle?: Omit<ViewStyle, 'width' | 'height'> & { width?: number; height?: number }
}