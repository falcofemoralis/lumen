import FilmCard from 'Component/FilmCard';
import ThemedView from 'Component/ThemedView';
import { DimensionValue, RefreshControl, ScrollView, TouchableOpacity } from 'react-native';
import { NUMBER_OF_COLUMNS, SCROLL_EVENT_UPDATES_MS } from './Grid.config';
import { styles } from './Grid.style';
import { GridComponentProps } from './Grid.type';

export function GridComponent(props: GridComponentProps) {
  const { rows, handleOnPress, onScroll } = props;

  const onRefresh = () => {
    console.log('Refresh');
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollView}
      refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={onRefresh}
        />
      }
      onScroll={onScroll}
      scrollEventThrottle={SCROLL_EVENT_UPDATES_MS}
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
              <TouchableOpacity
                key={film.id}
                style={{ width: (100 / NUMBER_OF_COLUMNS + '%') as DimensionValue }}
                onPress={() => handleOnPress(film)}
              >
                <FilmCard filmCard={film} />
              </TouchableOpacity>
            ))}
          </ThemedView>
        ))}
      </ThemedView>
    </ScrollView>
  );
}

export default GridComponent;
