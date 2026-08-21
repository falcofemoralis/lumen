import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { useIsTV } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import { t } from 'i18n/translate';
import { useCallback, useMemo, useRef, useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import { BACKUP_SECTION } from 'Type/Backup.interface';
import {
  BACKUP_SECTIONS,
  countBackupSection,
  exportBackup,
  getBackupSectionTitle,
} from 'Util/Backup';

import SettingExportComponent from './SettingExport.component';
import SettingExportComponentTV from './SettingExport.component.atv';

export function SettingExportContainer() {
  const isTV = useIsTV();
  const { currentService } = useServiceContext();
  const overlayRef = useRef<ThemedOverlayRef>(null);
  // everything is ticked to begin with -- a backup is normally taken whole
  const [selected, setSelected] = useState<BACKUP_SECTION[]>(() => [...BACKUP_SECTIONS]);
  const [isExporting, setIsExporting] = useState(false);

  // Counted when the overlay is opened rather than on every render: the counts come
  // from storage, and nothing in here changes them while the overlay is up.
  const [counts, setCounts] = useState<Partial<Record<BACKUP_SECTION, number>>>({});

  const items = useMemo(() => BACKUP_SECTIONS.map((section) => {
    const title = getBackupSectionTitle(section);
    const count = counts[section];

    return {
      label: count === undefined ? title : `${title} (${count})`,
      value: section,
      isChecked: selected.includes(section),
    };
  }), [selected, counts]);

  const onOpen = useCallback(() => {
    setCounts(BACKUP_SECTIONS.reduce((acc: Partial<Record<BACKUP_SECTION, number>>, section) => {
      const count = countBackupSection(section);

      if (count !== undefined) {
        acc[section] = count;
      }

      return acc;
    }, {}));

    overlayRef.current?.open();
  }, []);

  const onToggle = useCallback((value: string, isChecked: boolean) => {
    const section = value as BACKUP_SECTION;

    setSelected((prevSelected) => (isChecked
      ? [...prevSelected, section]
      : prevSelected.filter((item) => item !== section)));
  }, []);

  const onCancel = useCallback(() => {
    overlayRef.current?.close();
  }, []);

  const onExport = useCallback(async () => {
    if (!selected.length || isExporting) {
      return;
    }

    setIsExporting(true);

    try {
      // the order the sections are listed in, not the order they were ticked
      const sections = BACKUP_SECTIONS.filter((section) => selected.includes(section));
      const result = await exportBackup(sections, currentService);

      // a cancelled picker leaves the overlay up -- the selection is still the one
      // the user made, and backing out of the picker is not a change of mind about it
      if (result.status === 'ok') {
        overlayRef.current?.close();
        NotificationStore.displayMessage(t('Saved to {{fileName}}', { fileName: result.fileName }));
      }
    } catch (error) {
      NotificationStore.displayError(error as Error);
    } finally {
      setIsExporting(false);
    }
  }, [currentService, isExporting, selected]);

  const containerProps = {
    overlayRef,
    items,
    isExporting,
    onOpen,
    onToggle,
    onExport,
    onCancel,
  };

  return isTV
    ? <SettingExportComponentTV { ...containerProps } />
    : <SettingExportComponent { ...containerProps } />;
}

export default SettingExportContainer;
