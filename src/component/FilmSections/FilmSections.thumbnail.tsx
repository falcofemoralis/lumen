import { FilmCardThumbnail } from 'Component/FilmCard/FilmCard.thumbnail';
import { View } from 'react-native';

export const FilmSectionsThumbnail = ({
  width,
  numberOfColumns,
  styles,
}: {
  width: number;
  numberOfColumns: number;
  styles: any;
}) => {
  return (
    <View
      style={ {
        flexDirection: 'row',
        gap: styles.gridRow.gap,
      } }
    >
      { Array(numberOfColumns).fill(0).map((__, index) => (
        <FilmCardThumbnail
          // eslint-disable-next-line react/no-array-index-key
          key={ `film-list-thumb-col-${index}` }
          width={ width }
        />
      )) }
    </View>
  );
};
