import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { Info } from 'lucide-react-native';
import { View } from 'react-native';
import { useAppTheme } from 'Theme/context';

import { componentStyles } from './InfoBlock.style';
import { InfoBlockComponentProps } from './InfoBlock.type';

export function InfoBlockComponent({
  title,
  subtitle,
  hideIcon,
  style,
}: InfoBlockComponentProps) {
  const { scale, theme } = useAppTheme();
  const styles = useThemedStyles(componentStyles);

  return (
    <View style={ [styles.container, style] }>
      { !hideIcon && (
        <View style={ styles.iconContainer }>
          <Info
            size={ scale(24) }
            color={ theme.colors.icon }
          />
        </View>
      ) }
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
