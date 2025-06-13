import { Image } from 'expo-image';
import { forwardRef, useImperativeHandle } from 'react';

import { ThemedImageProps } from './ThemedImage.type';

type ImageRef = {
};

export const ThemedImage = forwardRef<ImageRef, ThemedImageProps>(({
  src,
  style,
  blurRadius,
  transition = 350,
}, ref) => {
  useImperativeHandle(ref, () => ({
  }));

  return (
    <Image
      style={ style }
      source={ src }
      // cachePolicy="memory-disk"
      placeholder={ { blurhash: 'L03IYJj[fQj[j[fQfQfQfQfQfQfQ' } }
      contentFit="cover"
      placeholderContentFit="cover"
      transition={ transition }
      recyclingKey={ src }
      // onError={(e) => console.error(e.error)}
      blurRadius={ blurRadius }
    />
  );
});

export default ThemedImage;
