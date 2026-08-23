import { SettingBase } from 'Component/SettingBase';
import { ThemedInput } from 'Component/ThemedInput';
import { ThemedMultiList } from 'Component/ThemedMultiList';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import {
  memo,
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View } from 'react-native';

import { componentStyles } from './SettingMultiSelect.style.atv';
import { SettingMultiSelectComponentProps } from './SettingMultiSelect.type';
import { buildSelectionSummary, matchesQuery } from './SettingMultiSelect.util';

export const SettingMultiSelectComponent = memo(({
  items,
  noItemsTitle,
  noItemsSubtitle,
  withSearch,
  handleOnChange,
  ...baseProps
}: SettingMultiSelectComponentProps) => {
  const { title, subtitle } = baseProps;
  const styles = useThemedStyles(componentStyles);
  const overlayRef = useRef<ThemedOverlayRef>(null);
  const [query, setQuery] = useState('');
  const searchFocusKey = useId();

  const selected = items.filter(({ isChecked }) => isChecked);

  const visibleItems = useMemo(
    () => (query ? items.filter(({ label }) => matchesQuery(label, query)) : items),
    [items, query]
  );

  // Kept out of the render body: the list is memoized on this element's
  // identity, so a fresh one on every keystroke would re-render it even when
  // the narrowed-down options have not changed.
  const searchComponent = useMemo(() => (
    <ThemedInput
      focusKey={ searchFocusKey }
      placeholder={ t('Search') }
      style={ styles.searchInput }
      onChangeText={ setQuery }
      autoCorrect={ false }
      autoCapitalize="none"
    />
  ), [searchFocusKey, styles]);

  // The query belongs to the session the overlay was open for, not to the
  // setting -- reopening it should show the whole list again.
  const handleClose = useCallback(() => setQuery(''), []);

  return (
    <View>
      <SettingBase
        { ...baseProps }
        subtitle={ selected.length
          ? buildSelectionSummary(selected.map(({ label }) => label))
          : subtitle }
        onPress={ () => overlayRef.current?.open() }
      />
      { /* The list sizes itself to a whole number of rows that fit the screen,
           so the overlay must not add a cap of its own. */ }
      <ThemedOverlay
        ref={ overlayRef }
        containerStyle={ styles.overlay }
        contentContainerStyle={ styles.overlayContent }
        // Left to Norigin without a search field -- the list is then the only
        // thing in here. With one, the claim has to be aimed: the field sits
        // above the rows, and resolving "closest to the top-left corner" against
        // a list that has not been laid out yet is what the prop exists for.
        preferredChildFocusKey={ withSearch ? searchFocusKey : undefined }
        onClose={ handleClose }
      >
        <ThemedMultiList
          header={ title }
          data={ visibleItems }
          noItemsTitle={ query ? t('Nothing found') : noItemsTitle }
          noItemsSubtitle={ query ? '' : noItemsSubtitle }
          searchComponent={ withSearch ? searchComponent : undefined }
          onChange={ handleOnChange }
        />
      </ThemedOverlay>
    </View>
  );
});

export default SettingMultiSelectComponent;
