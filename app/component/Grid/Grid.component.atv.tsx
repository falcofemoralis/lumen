import FilmCard from 'Component/FilmCard';
import ThemedView from 'Component/ThemedView';
import { useRef } from 'react';
import { DimensionValue, ScrollView, TouchableOpacity, TVFocusGuideView } from 'react-native';
import { NUMBER_OF_COLUMNS } from './Grid.config';
import { GridComponentProps } from './Grid.type';
import { styles } from './Grid.style.atv';

export function GridComponent(props: GridComponentProps) {
  const { rows } = props;
  const firstItemRef = useRef();

  return (
    <ScrollView>
      <TVFocusGuideView
        style={styles.rows}
        // @ts-ignore
        destinations={[firstItemRef.current]}
        autoFocus
      >
        {rows.map((row, rowIdx) => (
          <ThemedView
            key={rowIdx}
            style={styles.row}
          >
            {row.map((film, colIdx) => (
              <TouchableOpacity
                key={film.id}
                style={[
                  styles.item,
                  colIdx === row.length - 1 ? styles.lastItem : undefined,
                  {
                    maxWidth: (100 / NUMBER_OF_COLUMNS + '%') as DimensionValue,
                  },
                ]}
                // @ts-ignore
                ref={colIdx === 0 && rowIdx === 0 ? firstItemRef : undefined}
                hasTVPreferredFocus={colIdx === 0 && rowIdx === 0}
              >
                <FilmCard filmCard={film} />
              </TouchableOpacity>
            ))}
          </ThemedView>
        ))}
      </TVFocusGuideView>
    </ScrollView>
  );
}

export default GridComponent;
