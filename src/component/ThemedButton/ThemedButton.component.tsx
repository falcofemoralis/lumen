import ThemedImage from 'Component/ThemedImage';
import ThemedPressable from 'Component/ThemedPressable';
import ThemedText from 'Component/ThemedText';

import { styles } from './ThemedButton.style';
import { ThemedButtonProps } from './ThemedButton.type';

export default function ThemedButton({
  onPress,
  children,
  style,
  icon,
  rightImage,
  textStyle,
  rightImageStyle,
  disabled,
}: ThemedButtonProps) {
  return (
    <ThemedPressable
      style={ [styles.container, style, disabled && styles.disabled] }
      onPress={ onPress }
      disabled={ disabled }
    >
      { icon }
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
    </ThemedPressable>
  );
}
