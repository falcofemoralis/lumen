import ThemedView from 'Component/ThemedView';
import { DimensionValue, TouchableOpacity } from 'react-native';
import { GridComponentProps } from './Grid.type';
import FilmCard from 'Component/FilmCard';
import { NUMBER_OF_COLUMNS } from './Grid.config';

export function GridComponent(props: GridComponentProps) {
  const { rows } = props;

  return (
    <ThemedView style={{ flex: 1, flexDirection: 'column', width: '100%' }}>
      {rows.map((row, index) => (
        <ThemedView
          key={index}
          style={{
            flex: 1,
            flexDirection: 'row',
            width: '100%',
          }}
        >
          {row.map((film) => (
            <TouchableOpacity
              key={film.id}
              style={{ width: (100 / NUMBER_OF_COLUMNS + '%') as DimensionValue }}
            >
              <FilmCard film={film} />
            </TouchableOpacity>
          ))}
        </ThemedView>
      ))}
    </ThemedView>
  );
}

export default GridComponent;
