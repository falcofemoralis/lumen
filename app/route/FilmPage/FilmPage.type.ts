import Film from 'Type/Film.interface';

export interface FilmPageContainerProps {
  link: string;
}

export interface FilmPageComponentProps {
  film: Film | null;
}
