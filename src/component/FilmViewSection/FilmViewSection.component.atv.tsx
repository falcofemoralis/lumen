import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { View } from 'react-native';

import { componentStyles } from './FilmViewSection.style.atv';
import { FilmViewSectionComponentProps } from './FilmViewSection.type';

export function FilmViewSectionComponent({
  title,
  children,
}: FilmViewSectionComponentProps) {
  const styles = useThemedStyles(componentStyles);

  return (
    <View style={ [styles.card, styles.section] }>
      <ThemedText style={ styles.sectionHeading }>
        { title }
      </ThemedText>
      <View style={ styles.sectionContent }>
        { children }
      </View>
    </View>
  );
}

export default FilmViewSectionComponent;
