import { InfoBlock } from 'Component/InfoBlock';
import { ThemedButton } from 'Component/ThemedButton';
import { View } from 'react-native';
import { t } from 'i18n/translate';
import { SearchScreenComponentProps } from './SearchScreen.type';

export const SearchEmpty = ({ pagerItems, onNextLoad, filtersApplied }: SearchScreenComponentProps) => {
  const item = pagerItems[0];
  const more = item && item.pagination.currentPage < item.pagination.totalPages;
  return (
    <View style={ { alignItems: 'center', padding: 24, gap: 16 } }>
      <InfoBlock title={ filtersApplied && more ? 'На этой странице совпадений нет' : t('No results found') }
        subtitle={ more ? 'Продолжите поиск на следующих страницах или измените фильтры.' : t('Try searching for something else') } />
      { more && <ThemedButton title="Искать дальше" onPress={ () => onNextLoad(false, item) } /> }
    </View>
  );
};