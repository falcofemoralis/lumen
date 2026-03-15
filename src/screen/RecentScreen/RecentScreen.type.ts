import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { RecentItemInterface } from 'Type/RecentItem.interface';

export interface RecentScreenComponentProps {
  items: RecentItemInterface[];
  isLoading: boolean;
  hideConfirmOverlayRef: React.RefObject<ThemedOverlayRef | null>;
  onNextLoad: (isRefresh: boolean) => Promise<void>;
  handleOnPress: (item: RecentItemInterface) => void;
  removeItem: (item: RecentItemInterface) => void;
  openHideConfirmOverlay: (item: RecentItemInterface) => void;
  hideItem: () => void;
}

export type RecentGridItem = RecentItemInterface & {
  idx?: number;
  isDeleteButton?: boolean;
  isHideButton?: boolean;
};

export interface RecentGridRowProps {
  item: RecentGridItem;
  index: number;
  handleOnPress: (item: RecentItemInterface) => void;
  removeItem: (item: RecentItemInterface) => void;
  openHideConfirmOverlay: (item: RecentItemInterface) => void;
}
