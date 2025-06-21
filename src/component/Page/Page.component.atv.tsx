import { useIsFocused } from '@react-navigation/native';
import { Portal } from 'Component/ThemedPortal';
import { useNavigationContext } from 'Context/NavigationContext';
import React, { useCallback } from 'react';
import { View } from 'react-native';
import ErrorBoundary from 'react-native-error-boundary';
import Animated from 'react-native-reanimated';
import { Directions, SpatialNavigationRoot } from 'react-tv-space-navigation';
import { SpatialNavigationKeyboardLocker } from 'Util/RemoteControl/SpatialNavigationKeyboardLocker';

import { styles } from './Page.style.atv';
import { PageComponentProps } from './Page.type';

export function PageComponent({
  children,
  style,
  contentStyle,
  disableWrapper,
}: PageComponentProps) {
  const isFocused = useIsFocused();
  const { isMenuOpen, toggleMenu, isNavigationLocked } = useNavigationContext();

  const isActive = isFocused && !isMenuOpen;

  const onDirectionHandledWithoutMovement = useCallback(
    (movement: string) => {
      if (movement === Directions.LEFT && !isNavigationLocked) {
        toggleMenu(true);
      }
    },
    [toggleMenu, isNavigationLocked]
  );

  return (
    <Animated.View
      style={ !disableWrapper ? [
        styles.container,
        isMenuOpen && styles.containerOpened,
        style,
      ] : styles.wrapper }
    >
      <ErrorBoundary>
        <SpatialNavigationRoot
          isActive={ isActive }
          onDirectionHandledWithoutMovement={ onDirectionHandledWithoutMovement }
        >
          <SpatialNavigationKeyboardLocker />
          <Portal.Host>
            <View style={ !disableWrapper ? [styles.content, contentStyle] : styles.wrapper }>
              { children }
            </View>
          </Portal.Host>
        </SpatialNavigationRoot>
      </ErrorBoundary>
    </Animated.View>
  );
}

export default PageComponent;
