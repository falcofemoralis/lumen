import { View } from 'react-native';

import { styles } from './Thumbnail.style';
import { ThumbnailComponentProps } from './Thumbnail.type';

export const ThumbnailComponent = ({ style, height = '100%', width = '100%' }: ThumbnailComponentProps) => (
  <View style={ [
    styles.thumbnail,
    { height, width },
    style,
  ] }
  />
);

export default ThumbnailComponent;