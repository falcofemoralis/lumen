import { RecentItemInterface } from 'Type/RecentItem.interface';

export interface RecentPageComponentProps {
  isSignedIn: boolean;
  items: RecentItemInterface[];
  handleOnPress: (item: RecentItemInterface) => void;
  onScrollEnd: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export type RecentGridItem = RecentItemInterface & {
  isThumbnail?: boolean;
};

export interface RecentGridRowProps {
  item: RecentGridItem;
  handleOnPress: (item: RecentItemInterface) => void;
  index: number;
}
