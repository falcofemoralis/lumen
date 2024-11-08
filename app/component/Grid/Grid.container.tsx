import AppStore from 'Store/App.store';
import { GridContainerProps } from './Grid.type';
import GridComponent from './Grid.component';
import GridComponentTV from './Grid.component.atv';
import FilmCard from 'Type/FilmCard.interface';
import { NUMBER_OF_COLUMNS } from './Grid.config';
import { router } from 'expo-router';
import { withTV } from 'Hooks/withTV';

export function PlayerProgressBarContainer(props: GridContainerProps) {
  const { films } = props;

  const calculateRows = () => {
    const columns: FilmCard[][] = Array.from({ length: NUMBER_OF_COLUMNS }, () => []);

    films.forEach((film, index) => {
      columns[index % NUMBER_OF_COLUMNS].push(film);
    });

    // Now group the columns into rows
    const rows: FilmCard[][] = [];
    for (let i = 0; i < columns[0].length; i++) {
      const row: FilmCard[] = [];
      for (let j = 0; j < NUMBER_OF_COLUMNS; j++) {
        if (columns[j][i] !== undefined) {
          row.push(columns[j][i]);
        }
      }
      rows.push(row);
    }

    return rows;
  };

  const handleOnPress = (film: FilmCard) => {
    console.log('goToFilm');
    router.push({
      pathname: '/film/[link]',
      params: {
        link: film.link,
      },
    });
  };

  const containerFunctions = {
    handleOnPress,
  };

  const containerProps = () => {
    return {
      rows: calculateRows(),
    };
  };

  return withTV(GridComponentTV, GridComponent, {
    ...containerFunctions,
    ...containerProps(),
  });
}

export default PlayerProgressBarContainer;
