import ThemedText from 'Component/ThemedText';
import { Info } from 'lucide-react-native';
import { View } from 'react-native';
import { Colors } from 'Style/Colors';
import { scale } from 'Util/CreateStyles';

import { styles } from './InfoBlock.style';
import { InfoBlockComponentProps } from './InfoBlock.type';

export function InfoBlockComponent({
  title,
  subtitle,
}: InfoBlockComponentProps) {
  return (
    <View style={ styles.container }>
      <View style={ styles.iconContainer }>
        <Info
          size={ scale(24) }
          color={ Colors.white }
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

export default InfoBlockComponent;
