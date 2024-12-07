import ThemedView from 'Component/ThemedView';
import { noopFn } from 'Util/Function';
import { useMemo } from 'react';
import {
  DimensionValue,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  NUMBER_OF_COLUMNS,
  SCROLL_EVENT_END_PADDING,
  SCROLL_EVENT_UPDATES_MS,
} from './FilmGrid.config';
import { styles } from './FilmGrid.style';
import { FilmGridComponentProps } from './FilmGrid.type';
import FilmCard from 'Component/FilmCard';
import ThemedText from 'Component/ThemedText';

export function GridComponent(props: FilmGridComponentProps) {
  const { rows, handleOnPress, onScrollEnd, onRefresh = noopFn, isRefreshing = false } = props;

  const isCloseToBottom = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = SCROLL_EVENT_END_PADDING;

    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
  };

  const onScroll = async (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isCloseToBottom(event)) {
      onScrollEnd();
    }
  };

  const memoizedRows = useMemo(() => {
    return rows.map((row, index) => (
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
    ));
  }, [rows, handleOnPress]);

  return (
    <ScrollView
      contentContainerStyle={styles.scrollView}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
        />
      }
      onScroll={onScroll}
      scrollEventThrottle={SCROLL_EVENT_UPDATES_MS}
    >
      <ThemedView style={{ flex: 1, flexDirection: 'column', width: '100%' }}>
        {memoizedRows}
      </ThemedView>
      <ThemedText>Loading...</ThemedText>
    </ScrollView>
  );
}

export default GridComponent;
