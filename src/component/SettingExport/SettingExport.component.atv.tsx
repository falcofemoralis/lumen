import { SettingBase } from 'Component/SettingBase';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedMultiList } from 'Component/ThemedMultiList';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import HardDriveUpload from 'lucide-react-native/icons/hard-drive-upload';
import { View } from 'react-native';

import { componentStyles } from './SettingExport.style.atv';
import { SettingExportComponentProps } from './SettingExport.type';

export const SettingExportComponent = ({
  overlayRef,
  items,
  isExporting,
  onOpen,
  onToggle,
  onExport,
  onCancel,
}: SettingExportComponentProps) => {
  const styles = useThemedStyles(componentStyles);
  const isExportDisabled = isExporting || !items.some(({ isChecked }) => isChecked);

  return (
    <View>
      <SettingBase
        title={ t('Export') }
        subtitle={ t('Save settings and data to a file.') }
        IconComponent={ HardDriveUpload }
        onPress={ onOpen }
      />
      { /* The list sizes itself to a whole number of rows that fit the screen, so the
           overlay must not add a cap of its own -- see `SettingMultiSelect`. Focus is
           left to Norigin: the rows are what the overlay is opened for, and they sit
           closest to its top-left corner. */ }
      <ThemedOverlay
        ref={ overlayRef }
        contentContainerStyle={ styles.overlay }
      >
        <View style={ styles.container }>
          <ThemedMultiList
            header={ t('What to export') }
            data={ items }
            onChange={ onToggle }
          />
          <ThemedText style={ styles.note }>
            { t('The account is never part of a backup.') }
          </ThemedText>
          <View style={ styles.actions }>
            <ThemedButton
              title={ t('Cancel') }
              onPress={ onCancel }
              contentStyle={ styles.button }
            />
            <ThemedButton
              title={ t('Export') }
              disabled={ isExportDisabled }
              onPress={ onExport }
              style={ styles.buttonPrimary }
              contentStyle={ styles.button }
            />
          </View>
        </View>
      </ThemedOverlay>
    </View>
  );
};

export default SettingExportComponent;
