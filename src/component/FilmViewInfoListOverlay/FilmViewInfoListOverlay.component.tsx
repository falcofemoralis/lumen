import { FilmViewInfoList } from 'Component/FilmViewInfoList';
import { ThemedText } from 'Component/ThemedText';
import { Wrapper } from 'Component/Wrapper';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { View } from 'react-native';

import { componentStyles } from './FilmViewInfoListOverlay.style';
import { FilmViewInfoListOverlayComponentProps } from './FilmViewInfoListOverlay.type';

const FilmViewInfoListOverlayComponent = ({
  data,
  handleSelectCategory,
}: FilmViewInfoListOverlayComponentProps) => {
  const styles = useThemedStyles(componentStyles);

  return (
    <Wrapper style={ { flex: 1 } }>
      <View style={ styles.infoListGroups }>
        { data.map(({ id, title, items }) => (
          <View key={ id }>
            <View style={ styles.infoListHeader }>
              <ThemedText style={ styles.infoListHeaderText }>
                { title }
              </ThemedText>
              <View style={ styles.infoListHeaderCount }>
                <ThemedText style={ styles.infoListHeaderCountText }>
                  { items.length }
                </ThemedText>
              </View>
            </View>
            <View style={ styles.infoListCard }>
              { items.map((subItem, idx) => (
                <View key={ `info-list-${subItem.name}` }>
                  { idx > 0 && <View style={ styles.infoListDivider } /> }
                  <FilmViewInfoList
                    list={ subItem }
                    handleSelectCategory={ handleSelectCategory }
                  />
                </View>
              )) }
            </View>
          </View>
        )) }
      </View>
    </Wrapper>
  );
};

export default FilmViewInfoListOverlayComponent;
