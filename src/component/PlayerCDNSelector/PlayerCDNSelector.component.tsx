import { ThemedCustomSelect } from 'Component/ThemedCustomSelect';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedText } from 'Component/ThemedText';
import { ThemedToggle } from 'Component/ThemedToggle';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { View } from 'react-native';

import { componentStyles } from './PlayerCDNSelector.style';
import { PlayerCDNSelectorProps } from './PlayerCDNSelector.type';

export const PlayerCDNSelectorComponent = ({
  overlayRef,
  cdn,
  cdnOptions,
  isAutomatic,
  onAutomaticChange,
  onChange,
  onClose,
}: PlayerCDNSelectorProps) => {
  const styles = useThemedStyles(componentStyles);

  return (
    <ThemedOverlay
      ref={ overlayRef }
      containerStyle={ styles.overlay }
      contentContainerStyle={ styles.overlayContent }
      onClose={ onClose }
    >
      <View style={ styles.container }>
        <ThemedText style={ styles.title }>
          { t('CDN server') }
        </ThemedText>
        <View style={ styles.automaticRow }>
          <ThemedText>
            { t('Automatic') }
          </ThemedText>
          <ThemedToggle
            containerStyle={ styles.automaticToggle }
            inputWrapperStyle={ styles.automaticToggleInput }
            value={ isAutomatic }
            onValueChange={ onAutomaticChange }
          />
        </View>
        { /* the same picker the settings screen has, so an address that is not one of
             the presets can be typed in here too */ }
        <ThemedCustomSelect
          options={ cdnOptions }
          value={ cdn }
          onSelect={ onChange }
          disabled={ isAutomatic }
        />
      </View>
    </ThemedOverlay>
  );
};

export default PlayerCDNSelectorComponent;
