import { Image } from 'expo-image';
import { ThemedImageProps } from './ThemedImage.type';

export default function ThemedImage({ src, style }: ThemedImageProps) {
  const blurhash = 'L0Eo[IxufQxu-;fQfQfQfQfQfQfQ';

  return (
    <Image
      style={style}
      source={src}
      cachePolicy="memory-disk"
      placeholder={{ blurhash }}
      contentFit="cover"
      placeholderContentFit="cover"
      transition={1000}
      onError={(e) => console.log(e.error)}
    />
  );
}
