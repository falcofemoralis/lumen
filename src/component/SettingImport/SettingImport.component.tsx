import { ConfirmOverlay } from 'Component/ConfirmOverlay';
import { SettingBase } from 'Component/SettingBase';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { useServiceContext } from 'Context/ServiceContext';
import { t } from 'i18n/translate';
import HardDriveDownload from 'lucide-react-native/icons/hard-drive-download';
import { useCallback, useRef, useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import { BACKUP_SECTION, BackupFileInterface } from 'Type/Backup.interface';
import {
  applyBackup,
  formatBackupSections,
  getBackupSections,
  isSettingsSection,
  readBackup,
} from 'Util/Backup';
import { restartApp } from 'Util/Device';

/**
 * The overlay asks what the file is about to replace, and -- once the settings have been
 * written -- turns into the restart prompt rather than handing over to a second overlay,
 * which would have the two of them animating and, on TV, claiming focus at once.
 */
type ImportMode = 'confirm' | 'restart';

export const SettingImportComponent = () => {
  const { currentService } = useServiceContext();
  const overlayRef = useRef<ThemedOverlayRef>(null);
  const [mode, setMode] = useState<ImportMode>('confirm');
  // the file the user picked, held between the summary and the confirmation
  const [backup, setBackup] = useState<BackupFileInterface | null>(null);
  const [sections, setSections] = useState<BACKUP_SECTION[]>([]);

  const onPress = useCallback(async () => {
    try {
      const result = await readBackup();

      if (result.status === 'cancelled') {
        return;
      }

      if (result.status === 'invalid') {
        NotificationStore.displayError(t('The file is not a backup of this app.'));

        return;
      }

      const fileSections = getBackupSections(result.backup.data);

      if (!fileSections.length) {
        NotificationStore.displayError(t('The backup has nothing to import.'));

        return;
      }

      setMode('confirm');
      setBackup(result.backup);
      setSections(fileSections);
      overlayRef.current?.open();
    } catch (error) {
      NotificationStore.displayError(error as Error);
    }
  }, []);

  const onImport = useCallback(() => {
    if (!backup) {
      overlayRef.current?.close();

      return;
    }

    try {
      const applied = applyBackup(backup.data, currentService);

      if (!applied.length) {
        overlayRef.current?.close();
        NotificationStore.displayError(t('The backup has nothing to import.'));

        return;
      }

      // The bookmarks and the comments are read through MMKV hooks, so the screens
      // showing them pick the imported ones up on the spot. The settings are not: the
      // language, the service config and the global config are read once on start, so
      // what was just written to them only takes hold on the next one -- whichever of
      // the settings groups the file carried.
      if (applied.some(isSettingsSection)) {
        setMode('restart');

        return;
      }

      overlayRef.current?.close();
      NotificationStore.displayMessage(t('Backup imported'));
    } catch (error) {
      overlayRef.current?.close();
      NotificationStore.displayError(error as Error);
    } finally {
      setBackup(null);
    }
  }, [backup, currentService]);

  const onConfirm = useCallback(() => {
    if (mode === 'restart') {
      restartApp();

      return;
    }

    onImport();
  }, [mode, onImport]);

  const isRestart = mode === 'restart';

  return (
    <>
      <SettingBase
        title={ t('Import') }
        subtitle={ t('Restore settings and data from a file.') }
        IconComponent={ HardDriveDownload }
        onPress={ onPress }
      />
      <ConfirmOverlay
        overlayRef={ overlayRef }
        title={ isRestart ? t('Restart required') : t('Import backup') }
        message={ isRestart
          ? t('The app has to be restarted for the imported settings to take effect.')
          : t('This replaces what is on the device: {{sections}}.', {
            sections: formatBackupSections(sections),
          }) }
        confirmButtonText={ isRestart ? t('Restart') : t('Import') }
        cancelButtonText={ isRestart ? t('Later') : undefined }
        onConfirm={ onConfirm }
      />
    </>
  );
};

export default SettingImportComponent;
