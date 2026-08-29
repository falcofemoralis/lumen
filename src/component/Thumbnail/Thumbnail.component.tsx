import { StyleSheet } from 'react-native';
import SmartPlaceholder from 'react-native-smart-placeholder';
import { useAppTheme } from 'Theme/context';

import { ThumbnailComponentProps } from './Thumbnail.type';

export const ThumbnailComponent = ({ style, height, width }: ThumbnailComponentProps) => {
  const { theme, scale } = useAppTheme();
  const flatStyle = StyleSheet.flatten(style);

  return (
    <SmartPlaceholder
      height={ (flatStyle?.height as number | string | undefined) ?? height }
      width={ (flatStyle?.width as number | string | undefined) ?? width }
      backgroundColor={ theme.colors.thumbnail }
      animationColor={ theme.colors.thumbnailHighlight }
      borderRadius={ scale(12) }
      animationStyle='linear'
      style={ style }
    />
  );
};

export default ThumbnailComponent;
