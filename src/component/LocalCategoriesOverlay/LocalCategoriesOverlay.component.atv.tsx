import { ThemedButton } from 'Component/ThemedButton';
import { ThemedInput } from 'Component/ThemedInput';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { Plus, Trash2 } from 'lucide-react-native';
import { View } from 'react-native';
import { DefaultFocus, SpatialNavigationScrollView, SpatialNavigationView } from 'react-tv-space-navigation';
import { useAppTheme } from 'Theme/context';

import { componentStyles } from './LocalCategoriesOverlay.style.atv';
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
  const { scale } = useAppTheme();

  const renderList = () => (
    <>
      <SpatialNavigationScrollView style={ styles.list }>
        { !categories.length && (
          <ThemedText style={ styles.emptyText }>
            { t('No bookmarks group') }
          </ThemedText>
        ) }
        { categories.map((category) => (
          <SpatialNavigationView
            key={ category.id }
            direction="horizontal"
          >
            <View style={ styles.row }>
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
                  size: scale(14),
                } }
                onPress={ () => requestDelete(category.id) }
              />
            </View>
          </SpatialNavigationView>
        )) }
      </SpatialNavigationScrollView>
      <SpatialNavigationView direction="horizontal">
        <View style={ styles.actions }>
          <DefaultFocus>
            <ThemedButton
              IconComponent={ Plus }
              iconProps={ {
                size: scale(14),
              } }
              onPress={ startCreate }
              contentStyle={ styles.button }
            >
              { t('New category') }
            </ThemedButton>
          </DefaultFocus>
        </View>
      </SpatialNavigationView>
    </>
  );

  const renderCreate = () => (
    <DefaultFocus>
      <ThemedInput
        style={ styles.input }
        placeholder={ t('Category name') }
        onChangeText={ onChangeTitle }
        maxLength={ 40 }
      />
      <SpatialNavigationView direction="horizontal">
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
      </SpatialNavigationView>
    </DefaultFocus>
  );

  const renderConfirmDelete = () => (
    <>
      <ThemedText style={ styles.confirmTitle }>
        { deleteCandidateTitle }
      </ThemedText>
      <ThemedText style={ styles.confirmMessage }>
        { t('The category and its bookmarks will be removed from this device.') }
      </ThemedText>
      <SpatialNavigationView direction="horizontal">
        <View style={ styles.actions }>
          <DefaultFocus>
            <ThemedButton onPress={ cancelDelete } contentStyle={ styles.button }>
              { t('Cancel') }
            </ThemedButton>
          </DefaultFocus>
          <ThemedButton onPress={ confirmDelete } contentStyle={ [styles.button, styles.buttonPrimary] }>
            { t('Accept') }
          </ThemedButton>
        </View>
      </SpatialNavigationView>
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
