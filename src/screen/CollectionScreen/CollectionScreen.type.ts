import { ContentCollectionInterface } from 'Type/ContentCollection.interface';

export interface CollectionScreenComponentProps {
  items: ContentCollectionInterface[];
  isLoading: boolean;
  onNextLoad: (isRefresh: boolean) => Promise<void>;
  handleOnPress: (item: ContentCollectionInterface) => void;
}

export interface RecentGridRowProps {
  item: ContentCollectionInterface;
  index: number;
  handleOnPress: (item: ContentCollectionInterface) => void;
}
