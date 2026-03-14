import { useIsFocused } from '@react-navigation/native';
import { AppUpdater } from 'Component/AppUpdater';
import { InfoBlock } from 'Component/InfoBlock';
import { ThemedButton } from 'Component/ThemedButton';
import { Portal } from 'Component/ThemedPortal';
import { useNavigationContext } from 'Context/NavigationContext';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { GlobeX } from 'lucide-react-native';
import { useCallback } from 'react';
import { View } from 'react-native';
import { DefaultFocus, Directions, SpatialNavigationRoot } from 'react-tv-space-navigation';
import { restartApp } from 'Util/Device';
import { SpatialNavigationKeyboardLocker } from 'Util/RemoteControl/SpatialNavigationKeyboardLocker';

import { componentStyles } from './Page.style.atv';
import { PageComponentProps } from './Page.type';

export function PageComponent({
  children,
  style,
  contentStyle,
  fullscreen,
  isConnected,
}: PageComponentProps) {
  const isFocused = useIsFocused();
  const { isMenuOpen, toggleMenu, isNavigationLocked } = useNavigationContext();
  const styles = useThemedStyles(componentStyles);

  const onDirectionHandledWithoutMovement = useCallback(
    (movement: string) => {
      if (movement === Directions.LEFT && !isNavigationLocked) {
        toggleMenu(true);
      }
    },
    [toggleMenu, isNavigationLocked]
  );

  if (!isConnected) {
    return (
      <View
        style={ [
          styles.container,
          style,
        ] }
      >
        <SpatialNavigationRoot
          isActive={ isFocused && !isMenuOpen }
          onDirectionHandledWithoutMovement={ onDirectionHandledWithoutMovement }
        >
          <SpatialNavigationKeyboardLocker />
          <Portal.Host>
            <View style={ [styles.content, contentStyle, styles.noConnectionContainer] }>
              <InfoBlock
                title={ t('Network error') }
                subtitle={ t('Network request failed. Please check your internet connection and try again.') }
                Icon={ GlobeX }
              />
              <DefaultFocus>
                <ThemedButton style={ styles.btn } onPress={ restartApp }>
                  { t('Retry') }
                </ThemedButton>
              </DefaultFocus>
            </View>
          </Portal.Host>
        </SpatialNavigationRoot>
      </View>
    );
  }

  return (
    <View
      style={ [styles.container, style, fullscreen && styles.fullscreen] }
    >
      <SpatialNavigationRoot
        isActive={ isFocused && !isMenuOpen }
        onDirectionHandledWithoutMovement={ onDirectionHandledWithoutMovement }
      >
        <SpatialNavigationKeyboardLocker />
        <Portal.Host>
          <View style={ [styles.content, contentStyle, fullscreen && styles.fullscreen] }>
            <AppUpdater position='page' />
            { children }
          </View>
        </Portal.Host>
      </SpatialNavigationRoot>
    </View>
  );
}

export default PageComponent;
