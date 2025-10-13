import { Image } from 'expo-image';
import { memo } from 'react';
import { View } from 'react-native';

import { styles } from './ThemedImage.style';
import { ThemedImageProps } from './ThemedImage.type';

export const ThemedImage = ({
  src,
  style,
  blurRadius,
  transition = 250,
}: ThemedImageProps) => {
  return (
    <View style={ [styles.container, style] }>
      <Image
        style={ styles.image }
        source={ src }
        contentFit="cover"
        transition={ transition }
        recyclingKey={ src }
        blurRadius={ blurRadius }
      />
    </View>
  );
};

function rowPropsAreEqual(prevProps: ThemedImageProps, props: ThemedImageProps) {
  return prevProps.src === props.src;
}

export default memo(ThemedImage, rowPropsAreEqual);
