import { SettingBase } from 'Component/SettingBase';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { useConfigContext } from 'Context/ConfigContext';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { memo, useCallback, useRef } from 'react';
import { Image } from 'react-native';

import { componentStyles } from './SettingLink.style';
import { SettingLinkComponentProps } from './SettingLink.type';

export const SettingLinkComponent = memo(({
  imageLink,
  onPress,
  ...baseProps
}: SettingLinkComponentProps) => {
  const { isTV } = useConfigContext();
  const styles = useThemedStyles(componentStyles);
  const overlayRef = useRef<ThemedOverlayRef>(null);

  const handlePress = useCallback(async () => {
    if (isTV && imageLink) {
      overlayRef.current?.open();

      return;
    }

    await onPress();
  }, [imageLink, isTV, onPress]);

  const renderModal = () => {
    if (!imageLink) {
      return null;
    }

    return (
      <ThemedOverlay ref={ overlayRef } containerStyle={ styles.overlay }>
        <Image
          style={ styles.qrImage }
          source={ imageLink }
        />
      </ThemedOverlay>
    );
  };

  return (
    <>
      { isTV && renderModal() }
      <SettingBase
        { ...baseProps }
        onPress={ handlePress }
      />
    </>
  );
});

export default SettingLinkComponent;
