import { ListItem } from 'Component/ThemedMultiList/ThemedMultiList.type';
import { FilmInterface } from 'Type/Film.interface';

export interface BookmarksSelectorContainerProps {
  overlayId: string;
  film: FilmInterface;
}

export interface BookmarksSelectorComponentProps {
  overlayId: string;
  data: ListItem[];
  isLoading: boolean;
  postBookmark: (id: string, isChecked: boolean) => Promise<void>;
}
