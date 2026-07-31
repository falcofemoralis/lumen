import { ReactNode } from 'react';

export interface FilmViewSectionContainerProps {
  title: string;
  children: ReactNode;
  useHeadingWrapper?: boolean;
}

export type FilmViewSectionComponentProps = FilmViewSectionContainerProps;
