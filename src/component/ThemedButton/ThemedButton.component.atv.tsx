import { ThemedImage } from 'Component/ThemedImage';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { useAppTheme } from 'Theme/context';

import { componentStyles } from './ThemedButton.style.atv';
import { ThemedButtonProps } from './ThemedButton.type';

export default function ThemedButton({
  title,
  disabled,
  selected,
  style,
  contentStyle,
  styleDisabled,
  styleSelected,
  styleFocused,
  textStyle,
  onPress,
  onLongPress,
  onFocus,
  onEnterPress,
  IconComponent,
  iconProps,
  iconColor,
  iconColorFocused,
  leftImage,
  leftImageStyle,
  rightImage,
  rightImageStyle,
  autofocus,
  focusKey,
  textStyleFocused,
  topAdditionalElement,
  bottomAdditionalElement,
}: ThemedButtonProps) {
  const { scale, theme } = useAppTheme();
  const styles = useThemedStyles(componentStyles);

  return (
    <ThemedPressable
      onPress={ onPress }
      onLongPress={ onLongPress }
      onFocus={ onFocus }
      onEnterPress={ onEnterPress }
      style={ ({ isFocused }) => ([
        styles.container,
        style,
        selected && styles.selected,
        selected && styleSelected ? styleSelected: undefined,
        isFocused && styles.focused,
        isFocused && styleFocused ? styleFocused : undefined,
        disabled && styles.disabled,
        disabled && styleDisabled ? styleDisabled: undefined,
      ]) }
      contentStyle={ [styles.content, contentStyle] }
      topAdditionalElement={ topAdditionalElement
        ? ({ isFocused }) => topAdditionalElement(isFocused, selected ?? false)
        : undefined }
      bottomAdditionalElement={ bottomAdditionalElement
        ? ({ isFocused }) => bottomAdditionalElement(isFocused, selected ?? false)
        : undefined }
      autofocus={ autofocus }
      focusKey={ focusKey }
    >
      { ({ isFocused }) => (
        <>
          { IconComponent && (
            <IconComponent
              size={ scale(18) }
              color={ isFocused ? (iconColorFocused || theme.colors.iconFocused) : (iconColor || theme.colors.icon) }
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
            <ThemedText
              style={ [
                styles.text,
                textStyle,
                selected && styles.textSelected,
                isFocused && styles.textFocused,
                isFocused && textStyleFocused,
              ] }
            >
              { title }
            </ThemedText>
          ) }
          { rightImage && (
            <ThemedImage
              style={ [styles.image, rightImageStyle] }
              src={ rightImage }
            />
          ) }
        </>
      ) }
    </ThemedPressable>
  );
}
