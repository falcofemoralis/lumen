import { Loader } from 'Component/Loader';
import { useIsTV } from 'Context/ConfigContext';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedDropdown } from 'Component/ThemedDropdown';
import { ThemedScrollView } from 'Component/ThemedScrollView';
import { SettingMultiSelect } from 'Component/SettingMultiSelect';
import { SettingBase } from 'Component/SettingBase';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { ThemedText } from 'Component/ThemedText';
import { useRef } from 'react';
import { useWindowDimensions } from 'react-native';
import { useAppTheme } from 'Theme/context';
import { View } from 'react-native';
import { t } from 'i18n/translate';
import { SearchScreenComponentProps } from './SearchScreen.type';

const years = [
  { label: '', value: '' },
  ...Array.from({ length: new Date().getFullYear() + 4 - 1888 }, (_, index) => {
    const year = String(new Date().getFullYear() + 3 - index);
    return { label: year, value: year };
  }),
];
export const SearchFilters = (props: SearchScreenComponentProps) => {
  const { isCategoriesLoading } = props;
  const { scale } = useAppTheme();
  const { height, width } = useWindowDimensions();
  const isTV = useIsTV();
  const yearOverlayRef = useRef<ThemedOverlayRef>(null);
  const yearOptions = years.map((item) => item.value ? item : { ...item, label: t('Any year') });
  const validYears = !props.yearFrom || !props.yearTo || Number(props.yearFrom) <= Number(props.yearTo);
  const yearSummary = props.yearFrom || props.yearTo
    ? [props.yearFrom ? t('From year') + ': ' + props.yearFrom : '',
      props.yearTo ? t('To year') + ': ' + props.yearTo : ''].filter(Boolean).join(' — ')
    : t('Any year');

  return (
    <View style={ { height: Math.min(scale(400), height * 0.65), maxHeight: '100%' } }>
      <ThemedScrollView containerStyle={ { flex: 1 } }
        contentContainerStyle={ { padding: scale(12) } } style={ { gap: scale(12) } }>
        { isCategoriesLoading ? <Loader isLoading /> : (
          <>
            <SettingMultiSelect title={ t('Format') } subtitle={ t('Empty format selection means all formats.') }
              values={ props.selectedFormats } options={ props.formatOptions }
              onChange={ props.setSelectedFormats } />
            <SettingMultiSelect title={ t('Genre') } subtitle={ t('Any selected genre. Empty selection means all genres.') }
              values={ props.selectedGenres } options={ props.genreOptions } withSearch
              onChange={ props.setSelectedGenres } />
            <SettingBase title={ t('Year range') } subtitle={ yearSummary }
              onPress={ () => yearOverlayRef.current?.open() } />
            <SettingMultiSelect title={ t('Countries') } subtitle={ t('Uncheck countries to exclude them from search.') }
              values={ props.allowedCountries } options={ props.countryOptions } withSearch
              onChange={ props.setAllowedCountries } />
          </>
        ) }
      </ThemedScrollView>
      <View style={ { paddingHorizontal: scale(12), paddingVertical: scale(8), flexShrink: 0 } }>
        <ThemedButton title={ t('Lets search!') } disabled={ isCategoriesLoading }
          onPress={ props.handleApplyAdditionalContent } />
      </View>
      <ThemedOverlay ref={ yearOverlayRef } contentContainerStyle={ { maxHeight: '85%' } }>
        <View style={ { width: isTV ? Math.min(scale(420), width * 0.8) : undefined,
          height: Math.min(scale(280), height * 0.65), padding: scale(12) } }>
          <ThemedScrollView containerStyle={ { flex: 1 } } style={ { gap: scale(12) } }>
          <ThemedText>{ t('Year range') }</ThemedText>
          <View style={ { flexDirection: 'row', gap: scale(12) } }>
            <View style={ { flex: 1, gap: scale(8) } }>
              <ThemedText>{ t('From year') }</ThemedText>
              <ThemedDropdown header={ t('From year') } value={ props.yearFrom } data={ yearOptions }
                onChange={ (item) => props.setYearFrom(item.value) } closeOnChange />
            </View>
            <View style={ { flex: 1, gap: scale(8) } }>
              <ThemedText>{ t('To year') }</ThemedText>
              <ThemedDropdown header={ t('To year') } value={ props.yearTo } data={ yearOptions }
                onChange={ (item) => props.setYearTo(item.value) } closeOnChange />
            </View>
          </View>
          { !validYears && <ThemedText>{ t('The start year must not exceed the end year') }</ThemedText> }
          </ThemedScrollView>
          <View style={ { paddingTop: scale(12), flexShrink: 0 } }>
            <ThemedButton title={ t('Save') } disabled={ !validYears } onPress={ () => yearOverlayRef.current?.close() } />
          </View>
        </View>
      </ThemedOverlay>
    </View>
  );
};