import { ActorCardInterface } from 'Type/ActorCard.interface';

export interface FilmViewActorContainerProps {
  actor: ActorCardInterface;
  handleSelectActor: (link: string) => void;
}

export type FilmViewActorComponentProps = FilmViewActorContainerProps;
