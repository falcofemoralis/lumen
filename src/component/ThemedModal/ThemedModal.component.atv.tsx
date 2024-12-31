import { observer } from 'mobx-react-lite';
import { View } from 'react-native';
import { Portal } from 'react-native-paper';

import { SpatialNavigationOverlay } from './SpatialNavigationOverlay';
import { styles } from './ThemedModal.style.atv';
import { ThemedModalComponentProps } from './ThemedModal.type';

export function ThemedModalComponent({
  onHide,
  style,
  containerStyle,
  contentContainerStyle,
  children,
  isOpened,
  isVisible,
}: ThemedModalComponentProps) {
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

export default observer(ThemedModalComponent);
