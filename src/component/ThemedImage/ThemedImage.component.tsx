import { Image } from 'expo-image';
import { forwardRef, memo, useEffect, useImperativeHandle, useState } from 'react';
import { Colors } from 'Style/Colors';

import { ThemedImageProps } from './ThemedImage.type';

type ImageRef = {
};

export const ThemedImage = forwardRef<ImageRef, ThemedImageProps>(({
  src,
  style,
  blurRadius,
  transition = 250,
}, ref) => {
  useImperativeHandle(ref, () => ({
  }));

  return (
    <Image
      style={ style }
      source={ src }
      contentFit="cover"
      transition={ transition }
      recyclingKey={ src }
      blurRadius={ blurRadius }
    />
  );
});

function rowPropsAreEqual(prevProps: ThemedImageProps, props: ThemedImageProps) {
  return prevProps.src === props.src;
}

export default memo(ThemedImage, rowPropsAreEqual);
