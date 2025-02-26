import { Image } from 'expo-image';
import { memo } from 'react';

import { ThemedImageProps } from './ThemedImage.type';

export function ThemedImage({ src, style }: ThemedImageProps) {
  return (
    <Image
      style={ style }
      source={ src }
      // cachePolicy="memory-disk"
      placeholder={ { blurhash: 'L03IYJj[fQj[j[fQfQfQfQfQfQfQ' } }
      contentFit="cover"
      placeholderContentFit="cover"
      transition={ 350 }
      recyclingKey={ src }
      // onError={(e) => console.error(e.error)}
    />
  );
}

function rowPropsAreEqual(prevProps: ThemedImageProps, props: ThemedImageProps) {
  return prevProps.src === props.src;
}

export default memo(ThemedImage, rowPropsAreEqual);
