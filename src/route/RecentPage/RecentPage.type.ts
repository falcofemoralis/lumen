import { RecentItemInterface } from 'Type/RecentItem.interface';

export interface RecentPageComponentProps {
  items: RecentItemInterface[];
  onNextLoad: (isRefresh: boolean) => Promise<void>;
  handleOnPress: (item: RecentItemInterface) => void;
  removeItem: (item: RecentItemInterface) => void;
}

export type RecentGridItem = RecentItemInterface & {
  idx?: number;
  isDeleteButton?: boolean;
};

export interface RecentGridRowProps {
  item: RecentGridItem;
  index: number;
  handleOnPress: (item: RecentItemInterface) => void;
  removeItem: (item: RecentItemInterface) => void;
}
