import { View } from 'react-native';

import { SpatialNavigationOverlay } from './SpatialNavigationOverlay';
import { styles } from './ThemedModal.style.atv';
import { ThemedModalProps } from './ThemedModal.type';

export default function ThemedModalComponent({
  visible,
  onHide,
  style,
  contentContainerStyle,
  children,
}: ThemedModalProps) {
  if (!visible) return null;

  return (
    <View style={ [styles.modal, style] }>
      <View style={ styles.container }>
        <SpatialNavigationOverlay
          isModalVisible={ visible }
          hideModal={ onHide }
        >
          <View style={ contentContainerStyle }>
            { children }
          </View>
        </SpatialNavigationOverlay>
      </View>
    </View>
  );
}
