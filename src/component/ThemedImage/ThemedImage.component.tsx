import { Image } from 'expo-image';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { View } from 'react-native';

import { componentStyles } from './ThemedImage.style';
import { ThemedImageProps } from './ThemedImage.type';

export const ThemedImageComponent = ({
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

export default ThemedImageComponent;