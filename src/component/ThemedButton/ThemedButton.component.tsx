import ThemedIcon from 'Component/ThemedIcon';
import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import { TouchableOpacity } from 'react-native';
import { scale } from 'Util/CreateStyles';

import { styles } from './ThemedButton.style';
import { ThemedButtonProps } from './ThemedButton.type';

export default function ThemedButton({
  onPress,
  children,
  style,
  icon,
  rightImage,
  iconStyle,
  iconSize,
  textStyle,
  rightImageStyle,
  disabled,
}: ThemedButtonProps) {
  return (
    <TouchableOpacity
      style={ [styles.container, style, disabled && styles.disabled] }
      onPress={ onPress }
      disabled={ disabled }
    >
      { icon && (
        <ThemedIcon
          style={ [styles.icon, iconStyle] }
          icon={ icon }
          size={ iconSize ?? scale(16) }
          color="white"
        />
      ) }
      { children && (
        <ThemedText style={ [styles.text, textStyle] }>
          { children }
        </ThemedText>
      ) }
      { rightImage && (
        <ThemedImage
          style={ [styles.rightIcon, rightImageStyle] }
          src={ rightImage }
        />
      ) }
    </TouchableOpacity>
  );
}
