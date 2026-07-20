import { ThemedButton } from 'Component/ThemedButton';
import { ThemedInput } from 'Component/ThemedInput';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { Plus, Trash2 } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';
import { useAppTheme } from 'Theme/context';

import { componentStyles } from './LocalCategoriesOverlay.style';
import { LocalCategoriesOverlayComponentProps } from './LocalCategoriesOverlay.type';

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
  const { scale, theme } = useAppTheme();

  const renderList = () => (
    <>
      <ScrollView style={ styles.list }>
        { !categories.length && (
          <ThemedText style={ styles.emptyText }>
            { t('No bookmarks group') }
          </ThemedText>
        ) }
        { categories.map((category) => (
          <View
            key={ category.id }
            style={ styles.row }
          >
            <ThemedText style={ styles.rowTitle }>
              { category.title }
            </ThemedText>
            <ThemedText style={ styles.rowCount }>
              { category.count }
            </ThemedText>
            <ThemedButton
              style={ styles.rowDelete }
              contentStyle={ styles.rowDeleteContent }
              IconComponent={ Trash2 }
              iconProps={ {
                size: scale(16),
                color: theme.colors.text,
              } }
              onPress={ () => requestDelete(category.id) }
            />
          </View>
        )) }
      </ScrollView>
      <View style={ styles.actions }>
        <ThemedButton
          IconComponent={ Plus }
          iconProps={ {
            size: scale(16),
            color: theme.colors.text,
          } }
          onPress={ startCreate }
          contentStyle={ styles.button }
        >
          { t('New category') }
        </ThemedButton>
      </View>
    </>
  );

  const renderCreate = () => (
    <>
      <ThemedInput
        style={ styles.input }
        placeholder={ t('Category name') }
        onChangeText={ onChangeTitle }
        maxLength={ 40 }
      />
      <View style={ styles.actions }>
        <ThemedButton onPress={ cancelCreate } contentStyle={ styles.button }>
          { t('Cancel') }
        </ThemedButton>
        <ThemedButton
          onPress={ submitCreate }
          disabled={ isCreateDisabled }
          contentStyle={ [styles.button, styles.buttonPrimary] }
        >
          { t('Create') }
        </ThemedButton>
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
        <ThemedButton onPress={ cancelDelete } contentStyle={ styles.button }>
          { t('Cancel') }
        </ThemedButton>
        <ThemedButton onPress={ confirmDelete } contentStyle={ [styles.button, styles.buttonPrimary] }>
          { t('Accept') }
        </ThemedButton>
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
