import { ListItem } from 'Component/ThemedMultiList/ThemedMultiList.type';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { FilmInterface } from 'Type/Film.interface';

export interface BookmarksOverlayContainerProps {
  overlayRef: React.RefObject<ThemedOverlayRef | null>;
  film: FilmInterface;
  onClose?: () => void;
  onBookmarkChange?: (film: FilmInterface) => void;
}

export interface BookmarksOverlayComponentProps {
  overlayRef: React.RefObject<ThemedOverlayRef | null>;
  items: ListItem[];
  isLoading: boolean;
  postBookmark: (id: string, isChecked: boolean) => Promise<void>;
  onClose?: () => void;
}
