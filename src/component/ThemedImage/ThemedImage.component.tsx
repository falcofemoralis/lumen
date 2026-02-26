import { Image } from 'expo-image';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { memo } from 'react';
import { View } from 'react-native';

import { componentStyles } from './ThemedImage.style';
import { ThemedImageProps } from './ThemedImage.type';

export const ThemedImage = ({
  src,
  style,
  blurRadius,
  transition = 250,
  cachePolicy,
}: ThemedImageProps) => {
  const styles = useThemedStyles(componentStyles);

  return (
    <View style={ [styles.container, style] }>
      <Image
        style={ styles.image }
        source={ src }
        contentFit="cover"
        transition={ transition }
        recyclingKey={ src }
        blurRadius={ blurRadius }
        cachePolicy={ cachePolicy }
      />
    </View>
  );
};

function rowPropsAreEqual(prevProps: ThemedImageProps, props: ThemedImageProps) {
  return prevProps.src === props.src;
}

export default memo(ThemedImage, rowPropsAreEqual);
