import React, { memo } from 'react';
import { View } from 'react-native';
import { NitroImage } from 'react-native-nitro-image';

import { styles } from './ThemedImage.style';
import { ThemedImageProps } from './ThemedImage.type';

export const ThemedImage = ({ src, style }: ThemedImageProps) => (
  <View style={ [style, styles.container] }>
    <NitroImage
      style={ styles.image }
      image={ { url: src } }
      resizeMode="cover"
      recyclingKey={ src }
    />
  </View>
);

function rowPropsAreEqual(prevProps: ThemedImageProps, props: ThemedImageProps) {
  return prevProps.src === props.src;
}

export default memo(ThemedImage, rowPropsAreEqual);
