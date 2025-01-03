import ThemedIcon from 'Component/ThemedIcon';
import { Text, View } from 'react-native';
import { SpatialNavigationFocusableView } from 'react-tv-space-navigation';
import { scale } from 'Util/CreateStyles';

import { styles } from './ThemedButton.style.atv';
import { ThemedButtonProps } from './ThemedButton.type';

export default function ThemedButton({
  onPress,
  onFocus,
  children,
  style,
  iconStyle,
  textStyle,
  isSelected,
  icon,
  variant = 'filled',
}: ThemedButtonProps) {
  const renderFilled = (isFocused: boolean) => (
    <View
      style={ [
        styles.container,
        styles.containerFilled,
        style,
        isSelected && styles.containerFilledSelected,
        isFocused && styles.containerFilledFocused,
      ] }
    >
      { icon && (
        <ThemedIcon
          style={ [
            styles.iconFilled,
            iconStyle,
            isSelected && styles.iconFilledSelected,
            isFocused && styles.iconFilledFocused,
          ] }
          icon={ icon }
          size={ scale(18) }
          color={ isFocused ? 'black' : 'gray' }
        />
      ) }
      <Text
        style={ [
          styles.textFilled,
          textStyle,
          isSelected && styles.textFilledSelected,
          isFocused && styles.textFilledFocused,
        ] }
      >
        { children }
      </Text>
    </View>
  );

  const renderOutlined = (isFocused: boolean) => (
    <View
      style={ [
        styles.container,
        styles.containerOutlined,
        style,
        isSelected && styles.containerOutlinedSelected,
        isFocused && styles.containerOutlinedFocused,
      ] }
    >
      { icon && (
        <ThemedIcon
          style={ [
            styles.iconOutlined,
            iconStyle,
            isSelected && styles.iconOutlinedSelected,
            isFocused && styles.iconOutlinedFocused,
          ] }
          icon={ icon }
          size={ scale(18) }
          color={ isFocused ? 'black' : 'gray' }
        />
      ) }
      <Text
        style={ [
          styles.textOutlined,
          textStyle,
          isSelected && styles.textOutlinedSelected,
          isFocused && styles.textOutlinedFocused,
        ] }
      >
        { children }
      </Text>
    </View>
  );

  const renderButton = (isFocused: boolean) => {
    if (variant === 'outlined') {
      return renderOutlined(isFocused);
    }

    return renderFilled(isFocused);
  };

  return (
    <SpatialNavigationFocusableView
      onSelect={ onPress }
      onFocus={ onFocus }
    >
      { ({ isFocused }) => (
        renderButton(isFocused)
      ) }
    </SpatialNavigationFocusableView>
  );
}
