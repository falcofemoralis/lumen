import ThemedIcon from 'Component/ThemedIcon';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedText from 'Component/ThemedText';
import { View } from 'react-native';
import { scale } from 'Util/CreateStyles';

import { styles } from './ThemedInfo.style.atv';
import { ThemedInfoComponentProps } from './ThemedInfo.type';

export function ThemedInfoComponent({
  title,
  subtitle,
}: ThemedInfoComponentProps) {
  return (
    <View style={ styles.container }>
      <View style={ styles.iconContainer }>
        <ThemedIcon
          style={ styles.icon }
          icon={ {
            pack: IconPackType.MaterialCommunityIcons,
            name: 'information-outline',
          } }
          size={ scale(24) }
          color="white"
        />
      </View>
      <ThemedText style={ styles.title }>
        { title }
      </ThemedText>
      <ThemedText style={ styles.subtitle }>
        { subtitle }
      </ThemedText>
    </View>
  );
}

export default ThemedInfoComponent;
