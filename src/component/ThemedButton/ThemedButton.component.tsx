import { ThemedImage } from 'Component/ThemedImage';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';

import { componentStyles } from './ThemedButton.style';
import { ThemedButtonProps } from './ThemedButton.type';

export default function ThemedButton({
  onPress,
  onLongPress,
  children,
  style,
  contentStyle,
  IconComponent,
  iconProps,
  leftImage,
  rightImage,
  textStyle,
  leftImageStyle,
  rightImageStyle,
  disabled,
}: ThemedButtonProps) {
  const styles = useThemedStyles(componentStyles);

  return (
    <ThemedPressable
      style={ [styles.container, style, disabled && styles.disabled] }
      contentStyle={ [styles.content, contentStyle] }
      onPress={ onPress }
      onLongPress={ onLongPress }
      disabled={ disabled }
    >
      { IconComponent && (
        <IconComponent
          style={ styles.icon }
          { ...iconProps }
        />
      ) }
      { leftImage && (
        <ThemedImage
          style={ [styles.image, leftImageStyle] }
          src={ leftImage }
        />
      ) }
      { children && (
        <ThemedText style={ [styles.text, textStyle] }>
          { children }
        </ThemedText>
      ) }
      { rightImage && (
        <ThemedImage
          style={ [styles.image, rightImageStyle] }
          src={ rightImage }
        />
      ) }
    </ThemedPressable>
  );
}
