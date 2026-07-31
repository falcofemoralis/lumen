import { FilmViewInfoList } from 'Component/FilmViewInfoList';
import { ThemedText } from 'Component/ThemedText';
import { Wrapper } from 'Component/Wrapper';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { View } from 'react-native';
import { useAppTheme } from 'Theme/context';

import { componentStyles } from './FilmViewInfoListOverlay.style';
import { FilmViewInfoListOverlayComponentProps } from './FilmViewInfoListOverlay.type';

const FilmViewInfoListOverlayComponent = ({
  data,
  handleSelectCategory,
}: FilmViewInfoListOverlayComponentProps) => {
  const { scale } = useAppTheme();
  const styles = useThemedStyles(componentStyles);

  return (
    <Wrapper style={ { flex: 1 } }>
      <View>
        { data.map(({ id, title, items }, index) => (
          <View key={ id }>
            <ThemedText style={ [
              styles.infoListHeader,
              index > 0 && { marginTop: scale(16) },
            ] }
            >
              { title }
            </ThemedText>
            <View>
              { items.map((subItem, idx) => (
                <FilmViewInfoList
                  key={ `info-list-${subItem.name}` }
                  list={ subItem }
                  handleSelectCategory={ handleSelectCategory }
                />
              )) }
            </View>
          </View>
        )) }
      </View>
    </Wrapper>
  );
};

export default FilmViewInfoListOverlayComponent;
