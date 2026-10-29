import { useConfigContext } from 'Context/ConfigContext';
import { ThemedPressable } from 'Component/ThemedPressable';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import ArrowUp from 'lucide-react-native/icons/arrow-up';
import { useAppTheme } from 'Theme/context';

import { componentStyles } from './ScrollToTopButton.style.atv';
import { ScrollToTopButtonComponentProps } from './ScrollToTopButton.type';

export function ScrollToTopButtonComponent({ visible, onPress }: ScrollToTopButtonComponentProps) {
  const { scale, theme } = useAppTheme();
  const styles = useThemedStyles(componentStyles);
  const { scrollToTopButtonCornerTV } = useConfigContext();

  if (scrollToTopButtonCornerTV === 'off' || !visible) {
    return null;
  }

  return (
    <ThemedPressable
      onPress={ onPress }
      style={ ({ isFocused }) => [
        styles.container,
        styles[scrollToTopButtonCornerTV],
        isFocused && styles.focused,
      ] }
      contentStyle={ styles.content }
    >
      { ({ isFocused }) => (
        <ArrowUp
          size={ scale(16) }
          color={ isFocused ? theme.colors.textOnPrimary : theme.colors.primary }
        />
      ) }
    </ThemedPressable>
  );
}

export default ScrollToTopButtonComponent;