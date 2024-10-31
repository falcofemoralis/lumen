import FilmCard from 'Component/FilmCard';
import ThemedView from 'Component/ThemedView';
import { useRef } from 'react';
import { DimensionValue, TouchableOpacity, TVFocusGuideView } from 'react-native';
import { NUMBER_OF_COLUMNS } from './Grid.config';
import { GridComponentProps } from './Grid.type';

export function GridComponent(props: GridComponentProps) {
  const { rows } = props;
  const firstItemRef = useRef();

  return (
    <TVFocusGuideView
      style={{ flex: 1, flexDirection: 'column', width: '100%' }}
      // @ts-ignore
      destinations={[firstItemRef.current]}
      autoFocus
    >
      {rows.map((row, rowIdx) => (
        <ThemedView
          key={rowIdx}
          style={{
            flex: 1,
            flexDirection: 'row',
            width: '100%',
          }}
        >
          {row.map((film, colIdx) => (
            <TouchableOpacity
              key={film.id}
              style={{ width: (100 / NUMBER_OF_COLUMNS + '%') as DimensionValue }}
              // @ts-ignore
              ref={colIdx === 0 && rowIdx === 0 ? firstItemRef : undefined}
              hasTVPreferredFocus={colIdx === 0 && rowIdx === 0}
            >
              <FilmCard film={film} />
            </TouchableOpacity>
          ))}
        </ThemedView>
      ))}
    </TVFocusGuideView>
  );
}

export default GridComponent;
