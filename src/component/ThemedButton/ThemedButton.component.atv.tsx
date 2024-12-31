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
