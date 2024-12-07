import CachedImage from '../../lib/expo-cached-image';
import { ThemedImageProps } from './ThemedImage.type';
import { hash } from 'Util/Hash';
import { ActivityIndicator } from 'react-native';

export default function ThemedImage({ src, style }: ThemedImageProps) {
  const key = hash(src);

  console.log('ThemedImage', src);

  return (
    <CachedImage
      source={{
        uri: `${src}`, // (required) -- URI of the image to be cached
      }}
      cacheKey={`${key}-thumb`} // (required) -- key to store image locally
      placeholderContent={
        // (optional) -- shows while the image is loading
        <ActivityIndicator // can be any react-native tag
          color="#0000ff"
          size="small"
          style={{
            flex: 1,
            justifyContent: 'center',
          }}
        />
      }
      resizeMode="contain" // pass-through to <Image /> tag
      style={style}
      onError={(e) => console.log(e.nativeEvent.error)}
    />
  );
}
