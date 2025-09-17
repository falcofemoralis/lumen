import ThemedImage from 'Component/ThemedImage';
import { Text, View } from 'react-native';
import { SpatialNavigationFocusableView } from 'react-tv-space-navigation';
import { Colors } from 'Style/Colors';
import { scale } from 'Util/CreateStyles';

import { styles } from './ThemedButton.style.atv';
import { ThemedButtonProps } from './ThemedButton.type';

export default function ThemedButton({
  onPress,
  onFocus,
  children,
  style,
  styleFocused,
  IconComponent,
  iconProps,
  textStyle,
  isSelected,
  variant = 'filled',
  rightImage,
  rightImageStyle,
  disableRootActive,
  additionalElement,
}: ThemedButtonProps) {
  const renderFilled = (isFocused: boolean) => (
    <View
      style={ [
        styles.container,
        styles.containerFilled,
        style,
        isSelected && styles.containerFilledSelected,
        isFocused && styles.containerFilledFocused,
        isFocused && styleFocused,
      ] }
    >
      { additionalElement && additionalElement(isFocused, isSelected ?? false) }
      { IconComponent && (
        <IconComponent
          style={ [
            styles.iconFilled,
            isSelected && styles.iconFilledSelected,
            isFocused && styles.iconFilledFocused,
          ] }
          size={ scale(18) }
          color={ isFocused ? Colors.black : Colors.white }
          { ...iconProps }
        />
      ) }
      { children && (
        <Text
          style={ [
            styles.text,
            styles.textFilled,
            textStyle,
            isSelected && styles.textFilledSelected,
            isFocused && styles.textFilledFocused,
          ] }
        >
          { children }
        </Text>
      ) }
      { rightImage && (
        <ThemedImage
          style={ [styles.rightIcon, rightImageStyle] }
          src={ rightImage }
        />
      ) }
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
        isFocused && styleFocused,
      ] }
    >
      { IconComponent && (
        <IconComponent
          style={ [
            styles.iconFilled,
            isSelected && styles.iconFilledSelected,
            isFocused && styles.iconFilledFocused,
          ] }
          size={ scale(18) }
          color={ isFocused ? Colors.black : Colors.white }
          { ...iconProps }
        />
      ) }
      { children && (
        <Text
          style={ [
            styles.text,
            styles.textOutlined,
            textStyle,
            isSelected && styles.textOutlinedSelected,
            isFocused && styles.textOutlinedFocused,
          ] }
        >
          { children }
        </Text>
      ) }
    </View>
  );

  const renderButton = (isFocused: boolean) => {
    if (variant === 'outlined') {
      return renderOutlined(isFocused);
    }

    return renderFilled(isFocused);
  };

  const isActive = (isFocused: boolean, isRootActive: boolean) => {
    if (disableRootActive) {
      return isFocused;
    }

    return isFocused && isRootActive;
  };

  return (
    <SpatialNavigationFocusableView
      onSelect={ onPress }
      onFocus={ onFocus }
    >
      { ({ isFocused, isRootActive }) => (
        renderButton(isActive(isFocused, isRootActive))
      ) }
    </SpatialNavigationFocusableView>
  );
}
