import { ListItem } from 'Component/ThemedMultiList/ThemedMultiList.type';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { RefObject } from 'react';
import { FilmInterface } from 'Type/Film.interface';

export interface BookmarksOverlayContainerProps {
  overlayRef: RefObject<ThemedOverlayRef | null>;
  film: FilmInterface;
  onClose?: () => void;
  onBookmarkChange?: (film: FilmInterface) => void;
}

export interface BookmarksOverlayComponentProps {
  overlayRef: RefObject<ThemedOverlayRef | null>;
  items: ListItem[];
  isLoading: boolean;
  postBookmark: (id: string, isChecked: boolean) => Promise<void>;
  onClose?: () => void;
}
