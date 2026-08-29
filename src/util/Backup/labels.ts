import { t } from 'i18n/translate';
import { BACKUP_SECTION } from 'Type/Backup.interface';

/**
 * What a section is called wherever it is listed -- the export picker and the summary
 * shown before an import. Resolved on call so it follows the interface language.
 */
export const getBackupSectionTitle = (section: BACKUP_SECTION): string => {
  switch (section) {
    case BACKUP_SECTION.SETTINGS_APPEARANCE:
      return t('Appearance settings');
    case BACKUP_SECTION.SETTINGS_NETWORK:
      return t('Network settings');
    case BACKUP_SECTION.SETTINGS_DOWNLOADS:
      return t('Downloads settings');
    case BACKUP_SECTION.SETTINGS_PLAYER:
      return t('Player settings');
    case BACKUP_SECTION.SETTINGS_OTHER:
      return t('Other settings');
    case BACKUP_SECTION.BOOKMARKS:
      return t('Local bookmarks');
    case BACKUP_SECTION.COMMENTS:
      return t('My comments');
    case BACKUP_SECTION.NOTIFICATIONS:
      return t('Notifications');
    default:
      return '';
  }
};

export const formatBackupSections = (sections: BACKUP_SECTION[]): string => (
  sections.map(getBackupSectionTitle).join(', ')
);
