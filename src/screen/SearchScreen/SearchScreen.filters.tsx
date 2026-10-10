import { Loader } from 'Component/Loader';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedDropdown } from 'Component/ThemedDropdown';
import { ThemedScrollView } from 'Component/ThemedScrollView';
import { SettingMultiSelect } from 'Component/SettingMultiSelect';
import { View } from 'react-native';
import { t } from 'i18n/translate';
import { SearchScreenComponentProps } from './SearchScreen.type';

const years = [
  { label: 'Любой год', value: '' },
  ...Array.from({ length: new Date().getFullYear() + 4 - 1888 }, (_, index) => {
    const year = String(new Date().getFullYear() + 3 - index);
    return { label: year, value: year };
  }),
];
export const SearchFilters = (props: SearchScreenComponentProps) => {
  const { categories, selectedCategory, selectedGenre, isCategoriesLoading } = props;
  if (isCategoriesLoading) return <Loader isLoading />;
  return (
    <ThemedScrollView containerStyle={ { height: 340, maxHeight: '100%' } }>
      <View style={ { gap: 12, padding: 12 } }>
        <ThemedDropdown header={ t('Format') } value={ selectedCategory?.name ?? '' }
          data={ (categories ?? []).map((category) => ({ label: category.name, value: category.name })) }
          onChange={ (item) => {
            const category = categories?.find((category) => category.name === item.value);
            if (category) props.setSelectedCategory(category);
          } } closeOnChange />
        <ThemedDropdown header={ t('Genre') } value={ selectedGenre ?? '' }
          data={ (selectedCategory?.genres ?? []).map((genre) => ({ label: genre.name, value: genre.value })) }
          onChange={ (item) => props.setSelectedGenre(item.value) } closeOnChange />
        <ThemedDropdown header="От года" value={ props.yearFrom } data={ years }
          onChange={ (item) => props.setYearFrom(item.value) } closeOnChange />
        <ThemedDropdown header="До года" value={ props.yearTo } data={ years }
          onChange={ (item) => props.setYearTo(item.value) } closeOnChange />
        <SettingMultiSelect title="Страны" subtitle="Пустой список — все страны."
          values={ props.includedCountries } options={ props.countryOptions } withSearch
          onChange={ props.setIncludedCountries } />
        <SettingMultiSelect title="Разрешённые страны" subtitle="Снимите галочки стран, которые хотите исключить."
          values={ props.allowedCountries } options={ props.countryOptions } withSearch
          onChange={ props.setAllowedCountries } />
        <ThemedButton title={ t('Lets search!') } onPress={ props.handleApplyAdditionalContent } />
      </View>
    </ThemedScrollView>
  );
};