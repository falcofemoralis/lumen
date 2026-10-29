import { FilmDisplayMode } from '../../config';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { RefObject } from 'react';
import { RecentItemInterface } from 'Type/RecentItem.interface';

export interface RecentScreenComponentProps {
  displayMode: FilmDisplayMode;
  items: RecentItemInterface[];
  isLoading: boolean;
  hideConfirmOverlayRef: RefObject<ThemedOverlayRef | null>;
  removeConfirmOverlayRef: RefObject<ThemedOverlayRef | null>;
  onNextLoad: (isRefresh: boolean) => Promise<void>;
  handleOnPress: (item: RecentItemInterface) => void;
  handleContinueWatching: (item: RecentItemInterface) => void;
  removeItem: (item: RecentItemInterface) => void;
  openRemoveConfirmOverlay: (item: RecentItemInterface) => void;
  confirmRemoveItem: () => void;
  openHideConfirmOverlay: (item: RecentItemInterface) => void;
  hideItem: () => void;
  openNotifications: () => void;
}

export type RecentGridItem = RecentItemInterface & {
  idx?: number;
};

export interface RecentGridRowProps {
  item: RecentGridItem;
  index: number;
  handleOnPress: (item: RecentItemInterface) => void;
  handleContinueWatching: (item: RecentItemInterface) => void;
  removeItem: (item: RecentItemInterface) => void;
  openRemoveConfirmOverlay: (item: RecentItemInterface) => void;
  confirmRemoveItem: () => void;
  openHideConfirmOverlay: (item: RecentItemInterface) => void;
}
