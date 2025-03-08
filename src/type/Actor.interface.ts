import { FilmCardInterface } from './FilmCard.interface';

export interface ActorInterface {
  name: string;
  originalName: string;
  photo: string;
  careers?: string[];
  dob?: string;
  birthPlace?: string;
  height?: string;
  roles: ActorRole[];
}

export interface ActorRole {
  role: string;
  info?: string;
  films: FilmCardInterface[];
}
