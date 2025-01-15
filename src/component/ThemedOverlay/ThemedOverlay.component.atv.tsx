import { observer } from 'mobx-react-lite';
import { View } from 'react-native';
import { Portal } from 'react-native-paper';

import { SpatialNavigationOverlay } from './SpatialNavigationOverlay';
import { styles } from './ThemedOverlay.style.atv';
import { ThemedOverlayComponentProps } from './ThemedOverlay.type';

export function ThemedOverlayComponent({
  onHide,
  style,
  containerStyle,
  contentContainerStyle,
  children,
  isOpened,
  isVisible,
}: ThemedOverlayComponentProps) {
  if (!isOpened) return null;

  return (
    <Portal>
      <SpatialNavigationOverlay
        isModalVisible={ isOpened }
        hideModal={ onHide }
      >
        <Portal.Host>
          <View style={ [
            styles.modal,
            style,
            isVisible && styles.modalVisible,
          ] }
          >
            <View style={ [styles.container, containerStyle] }>
              <View style={ [styles.contentContainer, contentContainerStyle] }>
                { children }
              </View>
            </View>
          </View>
        </Portal.Host>
      </SpatialNavigationOverlay>
    </Portal>
  );
}

export default observer(ThemedOverlayComponent);
