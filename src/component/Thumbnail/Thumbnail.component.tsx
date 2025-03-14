import { View } from 'react-native';

import { styles } from './Thumbnail.style';
import { ThumbnailComponentProps } from './Thumbnail.type';

export const ThumbnailComponent = ({ style, height, width }: ThumbnailComponentProps) => (
  <View style={ [
    { height, width },
    style,
    styles.thumbnail,
  ] }
  />
);

export default ThumbnailComponent;
