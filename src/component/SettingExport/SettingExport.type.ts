import { ListItem } from 'Component/ThemedMultiList/ThemedMultiList.type';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { RefObject } from 'react';

export interface SettingExportComponentProps {
  overlayRef: RefObject<ThemedOverlayRef | null>;
  /** one item per backup section, ticked when it goes into the file */
  items: ListItem[];
  isExporting: boolean;
  onOpen: () => void;
  onToggle: (value: string, isChecked: boolean) => void;
  onExport: () => void;
  onCancel: () => void;
}
