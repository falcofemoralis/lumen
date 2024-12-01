import { router } from 'expo-router';
import { withTV } from 'Hooks/withTV';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import ConfigStore from 'Store/Config.store';
import FilmCard from 'Type/FilmCard.interface';
import GridComponent from './Grid.component';
import GridComponentTV from './Grid.component.atv';
import { NUMBER_OF_COLUMNS, NUMBER_OF_COLUMNS_TV, SCROLL_EVENT_END_PADDING } from './Grid.config';
import { GridContainerProps } from './Grid.type';

export function PlayerProgressBarContainer(props: GridContainerProps) {
  const { films, onScrollEnd } = props;

  const calculateRows = () => {
    const numberOfColumns = ConfigStore.isTV ? NUMBER_OF_COLUMNS_TV : NUMBER_OF_COLUMNS;

    const columns: FilmCard[][] = Array.from({ length: numberOfColumns }, () => []);

    films.forEach((film, index) => {
      columns[index % numberOfColumns].push(film);
    });

    // Now group the columns into rows
    const rows: FilmCard[][] = [];
    for (let i = 0; i < columns[0].length; i++) {
      const row: FilmCard[] = [];
      for (let j = 0; j < numberOfColumns; j++) {
        if (columns[j][i] !== undefined) {
          row.push(columns[j][i]);
        }
      }
      rows.push(row);
    }

    return rows;
  };

  const handleOnPress = (film: FilmCard) => {
    router.push({
      pathname: '/film/[link]',
      params: {
        link: film.link,
      },
    });
  };

  const isCloseToBottom = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = SCROLL_EVENT_END_PADDING;

    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isCloseToBottom(event) && onScrollEnd) {
      onScrollEnd();
    }
  };

  const containerFunctions = {
    handleOnPress,
    onScroll,
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
