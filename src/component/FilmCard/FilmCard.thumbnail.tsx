import { Thumbnail } from 'Component/Thumbnail';
import { View } from 'react-native';
import { useAppTheme } from 'Theme/context';

export const FilmCardThumbnail = ({
  width,
}: {
  width: number;
}) => {
  const { scale } = useAppTheme();

  return (
    <View style={ [{ gap: scale(8) }, { width }] }>
      <Thumbnail
        height={ width * (250 / 166) }
        width={ width }
      />
      <Thumbnail
        height={ scale(24) }
        width={ width }
      />
      <Thumbnail
        height={ scale(16) }
        width={ width * 0.5 }
      />
    </View>
  );};
