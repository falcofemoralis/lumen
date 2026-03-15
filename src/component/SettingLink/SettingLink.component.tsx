import { SettingBase } from 'Component/SettingBase';
import { propsAreEqual } from 'Component/SettingBase/SettingBase.component';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { useConfigContext } from 'Context/ConfigContext';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { memo, useRef } from 'react';
import { Image } from 'react-native';

import { componentStyles } from './SettingLink.style';
import { SettingLinkComponentProps } from './SettingLink.type';

export const SettingLinkComponent = memo(({
  setting,
  onUpdate,
}: SettingLinkComponentProps) => {
  const { isTV }= useConfigContext();
  const styles = useThemedStyles(componentStyles);
  const overlayRef = useRef<ThemedOverlayRef>(null);

  const renderModal = () => {
    return (
      <ThemedOverlay ref={ overlayRef } containerStyle={ styles.overlay }>
        <Image
          style={ styles.qrImage }
          source={ setting.imageLink as any }
        />
      </ThemedOverlay>
    );
  };

  return (
    <>
      { isTV && renderModal() }
      <SettingBase
        setting={ setting }
        onPress={ () => {
          if (isTV) {
            overlayRef.current?.open();
          } else {
            onUpdate(setting, '');
          }
        } }
      />
    </>
  );
}, propsAreEqual);

export default SettingLinkComponent;