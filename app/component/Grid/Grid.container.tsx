import AppStore from 'Store/App.store';
import { GridContainerProps } from './Grid.type';
import GridComponent from './Grid.component';
import GridComponentTV from './Grid.component.atv';
import Film from 'Type/Film.interface';
import { NUMBER_OF_COLUMNS } from './Grid.config';

export function PlayerProgressBarContainer(props: GridContainerProps) {
  const { films } = props;

  const calculateRows = () => {
    const columns: Film[][] = Array.from({ length: NUMBER_OF_COLUMNS }, () => []);

    films.forEach((film, index) => {
      columns[index % NUMBER_OF_COLUMNS].push(film);
    });

    // Now group the columns into rows
    const rows: Film[][] = [];
    for (let i = 0; i < columns[0].length; i++) {
      const row: Film[] = [];
      for (let j = 0; j < NUMBER_OF_COLUMNS; j++) {
        if (columns[j][i] !== undefined) {
          row.push(columns[j][i]);
        }
      }
      rows.push(row);
    }

    return rows;
  };

  const containerProps = () => {
    return {
      rows: calculateRows(),
    };
  };

  return AppStore.isTV ? (
    <GridComponentTV {...containerProps()} />
  ) : (
    <GridComponent {...containerProps()} />
  );
}

export default PlayerProgressBarContainer;
