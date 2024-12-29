import HomePage from 'Route/HomePage';
import PlayerPage from 'Route/PlayerPage';
import { FilmInterface } from 'Type/Film.interface';
import { FilmType } from 'Type/FilmType.type';

export function HomeScreen() {
  // const film = {
  //   id: '1',
  //   link: 'link',
  //   type: FilmType.Film,
  //   title: 'Мария',
  //   poster: '123',
  //   releaseDate: '29 августа 2024 года',
  //   countries: ['Германия'],
  // } as FilmInterface;

  // return (
  //   <PlayerPage
  //     video={ { streams: [] } }
  //     film={ film }
  //   />
  // );

  return <HomePage />;
}

export default HomeScreen;
