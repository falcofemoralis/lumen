import { InfoListInterface } from 'Type/InfoList.interface';

export interface FilmViewInfoListContainerProps {
  list: InfoListInterface;
  handleSelectCategory: (link: string) => void;
}

export type FilmViewInfoListComponentProps = FilmViewInfoListContainerProps;
