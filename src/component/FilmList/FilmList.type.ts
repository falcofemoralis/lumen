import { ComponentType, ReactElement, ReactNode } from 'react';
import { FilmCardInterface } from 'Type/FilmCard.interface';

export interface FilmListItem {
  film: FilmCardInterface;
  isWatched?: boolean;
  additionalInfo?: string;
}

export interface FilmListContainerProps {
  items: FilmListItem[];
  onFilmPress?: (film: FilmCardInterface) => void;
  onNextLoad?: (isRefresh: boolean) => Promise<void>;
  ListHeaderComponent?: ComponentType<any> | ReactElement | null | undefined;
  ListEmptyComponent?: ComponentType<any> | ReactElement | null | undefined;
  centerEmptyComponent?: boolean;
  disableStatusbarSafeArea?: boolean;
  actions?: ReactNode | ((item: FilmListItem) => ReactNode);
  onContinueWatching?: (item: FilmListItem) => void;
  onRemove?: (item: FilmListItem) => void;
  onToggleWatched?: (item: FilmListItem) => void;
  onHideConfirm?: (item: FilmListItem) => void;
}
