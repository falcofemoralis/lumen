import { ThemedImage } from 'Component/ThemedImage';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { useAppTheme } from 'Theme/context';

import { componentStyles } from './ThemedButton.style';
import { ThemedButtonProps } from './ThemedButton.type';

export default function ThemedButton({
  title,
  disabled,
  style,
  styleOverride,
  contentStyle,
  styleDisabled,
  textStyle,
  onPress,
  onLongPress,
  IconComponent,
  iconProps,
  iconColor,
  leftImage,
  leftImageStyle,
  rightImage,
  rightImageStyle,
  topAdditionalElement,
  bottomAdditionalElement,
  rightAdditionalElement,
}: ThemedButtonProps) {
  const { scale, theme } = useAppTheme();
  const styles = useThemedStyles(componentStyles);

  return (
    <ThemedPressable
      style={ [
        styles.container,
        style,
        styleOverride,
        disabled && styles.disabled,
        disabled && styleDisabled ? styleDisabled: undefined,
      ] }
      contentStyle={ [styles.content, contentStyle] }
      onPress={ onPress }
      onLongPress={ onLongPress }
      disabled={ disabled }
      topAdditionalElement={ topAdditionalElement
        ? ({ isFocused }) => topAdditionalElement(isFocused, false)
        : undefined }
      bottomAdditionalElement={ bottomAdditionalElement
        ? ({ isFocused }) => bottomAdditionalElement(isFocused, false)
        : undefined }
    >
      { IconComponent && (
        <IconComponent
          style={ styles.icon }
          size={ scale(18) }
          color={ iconColor || theme.colors.icon }
          { ...iconProps }
        />
      ) }
      { leftImage && (
        <ThemedImage
          style={ [styles.image, leftImageStyle] }
          src={ leftImage }
        />
      ) }
      { title && (
        <ThemedText style={ [styles.text, textStyle] }>
          { title }
        </ThemedText>
      ) }
      { rightImage && (
        <ThemedImage
          style={ [styles.image, rightImageStyle] }
          src={ rightImage }
        />
      ) }
      { rightAdditionalElement && rightAdditionalElement(false, false) }
    </ThemedPressable>
  );
}
