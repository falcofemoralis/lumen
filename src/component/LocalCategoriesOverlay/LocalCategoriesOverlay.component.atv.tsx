import { ThemedButton } from 'Component/ThemedButton';
import { ThemedInput } from 'Component/ThemedInput';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedScrollView } from 'Component/ThemedScrollView';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import Plus from 'lucide-react-native/icons/plus';
import Trash2 from 'lucide-react-native/icons/trash-2';
import { View } from 'react-native';
import { useAppTheme } from 'Theme/context';

import { componentStyles } from './LocalCategoriesOverlay.style.atv';
import { LocalCategoriesOverlayComponentProps } from './LocalCategoriesOverlay.type';

const NEW_CATEGORY_FOCUS_KEY = 'LOCAL_CATEGORIES_NEW_CATEGORY';

export const LocalCategoriesOverlayComponent = ({
  overlayRef,
  categories,
  mode,
  deleteCandidateTitle,
  startCreate,
  cancelCreate,
  submitCreate,
  onChangeTitle,
  isCreateDisabled,
  requestDelete,
  cancelDelete,
  confirmDelete,
  resetMode,
}: LocalCategoriesOverlayComponentProps) => {
  const styles = useThemedStyles(componentStyles);
  const { scale } = useAppTheme();

  const renderList = () => (
    <>
      <ThemedScrollView containerStyle={ styles.list }>
        { !categories.length && (
          <ThemedText style={ styles.emptyText }>
            { t('No bookmarks group') }
          </ThemedText>
        ) }
        { categories.map((category) => (
          <View key={ category.id } style={ styles.row }>
            <ThemedText style={ styles.rowTitle }>
              { category.title }
            </ThemedText>
            <ThemedText style={ styles.rowCount }>
              { category.count }
            </ThemedText>
            <ThemedButton
              title=""
              style={ styles.rowDelete }
              contentStyle={ styles.rowDeleteContent }
              IconComponent={ Trash2 }
              iconProps={ {
                size: scale(14),
              } }
              onPress={ () => requestDelete(category.id) }
            />
          </View>
        )) }
      </ThemedScrollView>
      <View style={ styles.actions }>
        <ThemedButton
          title={ t('New category') }
          focusKey={ NEW_CATEGORY_FOCUS_KEY }
          autofocus
          IconComponent={ Plus }
          iconProps={ {
            size: scale(14),
          } }
          onPress={ startCreate }
          contentStyle={ styles.button }
        />
      </View>
    </>
  );

  const renderCreate = () => (
    <>
      <ThemedInput
        autofocus
        style={ styles.input }
        placeholder={ t('Category name') }
        onChangeText={ onChangeTitle }
        maxLength={ 40 }
      />
      <View style={ styles.actions }>
        <ThemedButton
          title={ t('Cancel') }
          onPress={ cancelCreate }
          contentStyle={ styles.button }
        />
        <ThemedButton
          title={ t('Create') }
          onPress={ submitCreate }
          disabled={ isCreateDisabled }
          style={ styles.buttonPrimary }
          contentStyle={ styles.button }
        />
      </View>
    </>
  );

  const renderConfirmDelete = () => (
    <>
      <ThemedText style={ styles.confirmTitle }>
        { deleteCandidateTitle }
      </ThemedText>
      <ThemedText style={ styles.confirmMessage }>
        { t('The category and its bookmarks will be removed from this device.') }
      </ThemedText>
      <View style={ styles.actions }>
        <ThemedButton
          title={ t('Cancel') }
          autofocus
          onPress={ cancelDelete }
          contentStyle={ styles.button }
        />
        <ThemedButton
          title={ t('Accept') }
          onPress={ confirmDelete }
          style={ styles.buttonPrimary }
          contentStyle={ styles.button }
        />
      </View>
    </>
  );

  const renderContent = () => {
    if (mode === 'create') {
      return renderCreate();
    }

    if (mode === 'confirmDelete') {
      return renderConfirmDelete();
    }

    return renderList();
  };

  return (
    <ThemedOverlay
      ref={ overlayRef }
      contentContainerStyle={ styles.overlay }
      onClose={ resetMode }
      // the list sits above the actions, so entry focus would otherwise land on
      // the scroll view -- on itself, while there are no categories to focus
      preferredChildFocusKey={ NEW_CATEGORY_FOCUS_KEY }
      useKeyboardAdjustment
    >
      <View style={ styles.container }>
        <ThemedText style={ styles.title }>
          { t('Manage categories') }
        </ThemedText>
        { renderContent() }
      </View>
    </ThemedOverlay>
  );
};

export default LocalCategoriesOverlayComponent;
