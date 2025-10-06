import { Image } from 'expo-image';
import { memo } from 'react';

import { ThemedImageProps } from './ThemedImage.type';

export const ThemedImage = ({
  src,
  style,
  blurRadius,
  transition = 250,
}: ThemedImageProps) => {
  return (
    <Image
      style={ style }
      source={ src }
      placeholder={ { blurhash: 'L03IYJj[fQj[j[fQfQfQfQfQfQfQ' } }
      placeholderContentFit="cover"
      contentFit="cover"
      transition={ transition }
      recyclingKey={ src }
      blurRadius={ blurRadius }
    />
  );
};

function rowPropsAreEqual(prevProps: ThemedImageProps, props: ThemedImageProps) {
  return prevProps.src === props.src;
}

export default memo(ThemedImage, rowPropsAreEqual);
