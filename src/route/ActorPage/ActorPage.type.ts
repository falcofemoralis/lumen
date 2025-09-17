import { ParamListBase, RouteProp } from '@react-navigation/native';
import { ActorInterface } from 'Type/Actor.interface';
import { FilmCardInterface } from 'Type/FilmCard.interface';

export interface ActorPageContainerProps {
  route: RouteProp<ParamListBase, string>;
}

export interface ActorPageComponentProps {
  isLoading: boolean;
  actor: ActorInterface | null;
  handleSelectFilm: (film: FilmCardInterface) => void;
}
