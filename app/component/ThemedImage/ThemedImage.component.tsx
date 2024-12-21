import { Image } from 'expo-image';
import { ThemedImageProps } from './ThemedImage.type';

export default function ThemedImage({ src, style }: ThemedImageProps) {
  return (
    <Image
      style={style}
      source={src}
      // cachePolicy="memory-disk"
      placeholder={{ blurhash: 'L03IYJj[fQj[j[fQfQfQfQfQfQfQ' }}
      contentFit="cover"
      placeholderContentFit="cover"
      transition={1000}
      // onError={(e) => console.error(e.error)}
    />
  );
}
