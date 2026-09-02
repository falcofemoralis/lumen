import { ThemedButton } from 'Component/ThemedButton';
import { ThemedDropdown } from 'Component/ThemedDropdown';
import { DropdownItem } from 'Component/ThemedDropdown/ThemedDropdown.type';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { ThemedText } from 'Component/ThemedText';
import { ThemedToggle } from 'Component/ThemedToggle';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { useRef } from 'react';
import { View } from 'react-native';

import { componentStyles } from './PlayerSubtitlesStyleSelector.style.atv';
import {
  PlayerSubtitlesStyleSelectorComponentProps,
  PlayerSubtitlesStyleSettingValue,
} from './PlayerSubtitlesStyleSelector.type';

// a real component rather than a render helper, so that the overlay each row opens gets
// a ref of its own instead of one shared by whichever row was drawn last
const SubtitlesStyleRow = ({
  setting,
  isEnabled,
  onChange,
}: {
  setting: PlayerSubtitlesStyleSettingValue;
  isEnabled: boolean;
  onChange: (setting: PlayerSubtitlesStyleSettingValue, item: DropdownItem) => void;
}) => {
  const styles = useThemedStyles(componentStyles);
  const overlayRef = useRef<ThemedOverlayRef>(null);
  const { label, options, value } = setting;

  const selectedOption = options.find((option) => option.value === value);

  return (
    <View style={ styles.row }>
      <ThemedText
        style={ [styles.rowLabel, !isEnabled && styles.rowDisabled] }
        numberOfLines={ 2 }
      >
        { label }
      </ThemedText>
      <ThemedButton
        title={ selectedOption?.label ?? value }
        style={ styles.rowInput }
        contentStyle={ styles.rowInputContent }
        disabled={ !isEnabled }
        // a disabled button stays focusable on TV - dropping out of the row order
        // would move the focus around as the switch is flipped - so the press is what
        // has to be held back
        onPress={ () => {
          if (!isEnabled) {
            return;
          }

          overlayRef.current?.open();
        } }
      />
      <ThemedDropdown
        asOverlay
        overlayRef={ overlayRef }
        header={ label }
        value={ value }
        data={ options }
        closeOnChange
        onChange={ (item) => onChange(setting, item) }
      />
    </View>
  );
};

export const PlayerSubtitlesStyleSelectorComponent = ({
  overlayRef,
  isCustomStyle,
  settings,
  onCustomStyleChange,
  onChange,
  onClose,
}: PlayerSubtitlesStyleSelectorComponentProps) => {
  const styles = useThemedStyles(componentStyles);

  return (
    <ThemedOverlay
      /* No backdrop, unlike every other overlay the player puts up: what is being
         styled is drawn on the picture behind this one, and a dimmed picture is the
         one thing that would keep the user from seeing the change they just made. */
      transparent
      ref={ overlayRef }
      contentContainerStyle={ styles.overlayContent }
      onClose={ onClose }
    >
      <View style={ styles.container }>
        <ThemedText style={ styles.title }>
          { t('Subtitles style') }
        </ThemedText>
        <View style={ styles.row }>
          <ThemedText style={ styles.rowLabel }>
            { t('Custom style') }
          </ThemedText>
          <ThemedToggle
            containerStyle={ styles.toggle }
            inputWrapperStyle={ styles.toggleInput }
            value={ isCustomStyle }
            onValueChange={ onCustomStyleChange }
          />
        </View>
        { settings.map((setting) => (
          <SubtitlesStyleRow
            key={ setting.key }
            setting={ setting }
            isEnabled={ isCustomStyle }
            onChange={ onChange }
          />
        )) }
      </View>
    </ThemedOverlay>
  );
};

export default PlayerSubtitlesStyleSelectorComponent;
