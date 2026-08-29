import { SettingBase } from 'Component/SettingBase';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedMultiList } from 'Component/ThemedMultiList';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import HardDriveUpload from 'lucide-react-native/icons/hard-drive-upload';
import { View } from 'react-native';

import { componentStyles } from './SettingExport.style';
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
              style={ styles.button }
              contentStyle={ styles.buttonContent }
            />
            <ThemedButton
              title={ t('Export') }
              disabled={ isExportDisabled }
              onPress={ onExport }
              style={ [styles.button, styles.buttonPrimary] }
              contentStyle={ styles.buttonContent }
            />
          </View>
        </View>
      </ThemedOverlay>
    </View>
  );
};

export default SettingExportComponent;
