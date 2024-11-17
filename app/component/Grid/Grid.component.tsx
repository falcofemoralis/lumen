import ThemedView from 'Component/ThemedView';
import { DimensionValue, RefreshControl, ScrollView, TouchableOpacity } from 'react-native';
import { GridComponentProps } from './Grid.type';
import FilmCard from 'Component/FilmCard';
import { NUMBER_OF_COLUMNS } from './Grid.config';
import ThemedTouchableOpacity from 'Component/ThemedTouchableOpacity';

export function GridComponent(props: GridComponentProps) {
  const { rows } = props;

  return (
    <ScrollView
      contentContainerStyle={styles.scrollView}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
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
              <ThemedTouchableOpacity
                key={film.id}
                style={{ width: (100 / NUMBER_OF_COLUMNS + '%') as DimensionValue }}
              >
                <FilmCard film={film} />
              </ThemedTouchableOpacity>
            ))}
          </ThemedView>
        ))}
      </ThemedView>
    </ScrollView>
  );
}

export default GridComponent;
