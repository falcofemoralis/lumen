import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation-react-native-tvos';
import { InfoBlock } from 'Component/InfoBlock';
import { ThemedButton } from 'Component/ThemedButton';
import { Portal } from 'Component/ThemedPortal';
import { useNavigationContext } from 'Context/NavigationContext';
import { useIsScreenFocused } from 'Hooks/useIsScreenFocused';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import GlobeX from 'lucide-react-native/icons/globe-x';
import { View } from 'react-native';
import { restartApp } from 'Util/Device';

import { componentStyles } from './Page.style.atv';
import { PageComponentProps } from './Page.type';

export function PageComponent({
  children,
  style,
  isConnected,
  fullscreen,
}: PageComponentProps) {
  const styles = useThemedStyles(componentStyles);
  const isScreenFocused = useIsScreenFocused();
  const { isMenuOpen } = useNavigationContext();

  const { ref, focusKey } = useFocusable<object, View>({
    focusable: isScreenFocused,
  });

  const renderContent = () => {
    if (!isConnected) {
      return (
        <View style={ styles.noConnectionContainer }>
          <InfoBlock
            title={ t('Network error') }
            subtitle={ t('Network request failed. Please check your internet connection and try again.') }
            Icon={ GlobeX }
          />
          <ThemedButton
            title={ t('Retry') }
            style={ styles.button }
            onPress={ restartApp }
            autofocus
          />
        </View>
      );
    }

    return children;
  };

  return (
    <Portal.Host>
      <FocusContext.Provider value={ focusKey }>
        <View
          ref={ ref }
          style={ [
            styles.container,
            isMenuOpen && styles.containerOpened,
            fullscreen && styles.fullscreen,
            style,
          ] }
        >
          { renderContent() }
        </View>
      </FocusContext.Provider>
    </Portal.Host>
  );
}

export default PageComponent;
