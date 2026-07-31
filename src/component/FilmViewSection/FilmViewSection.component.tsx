import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { View } from 'react-native';

import { componentStyles } from './FilmViewSection.style';
import { FilmViewSectionComponentProps } from './FilmViewSection.type';

export function FilmViewSectionComponent({
  title,
  children,
  useHeadingWrapper,
}: FilmViewSectionComponentProps) {
  const styles = useThemedStyles(componentStyles);

  return (
    <View style={ styles.section }>
      <ThemedText style={ [styles.sectionHeading, useHeadingWrapper && styles.sectionHeadingWrapper] }>
        { title }
      </ThemedText>
      <View style={ styles.sectionContent }>
        { children }
      </View>
    </View>
  );
}

export default FilmViewSectionComponent;
