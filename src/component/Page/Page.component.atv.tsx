import { useIsFocused } from '@react-navigation/native';
import { AppUpdater } from 'Component/AppUpdater';
import { Portal } from 'Component/ThemedPortal';
import { useNavigationContext } from 'Context/NavigationContext';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { useCallback } from 'react';
import { View } from 'react-native';
import { Directions, SpatialNavigationRoot } from 'react-tv-space-navigation';
import { SpatialNavigationKeyboardLocker } from 'Util/RemoteControl/SpatialNavigationKeyboardLocker';

import { componentStyles } from './Page.style.atv';
import { PageComponentProps } from './Page.type';

export function PageComponent({
  children,
  style,
  contentStyle,
  fullscreen,
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
