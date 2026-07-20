import { Loader } from 'Component/Loader';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedInput } from 'Component/ThemedInput';
import { ThemedMultiList } from 'Component/ThemedMultiList';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { Plus } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { DefaultFocus, SpatialNavigationView } from 'react-tv-space-navigation';
import { useAppTheme } from 'Theme/context';

import { componentStyles } from './BookmarksOverlay.style.atv';
import { BookmarksOverlayComponentProps } from './BookmarksOverlay.type';

export const BookmarksOverlayComponent = ({
  overlayRef,
  items,
  isLoading,
  isLocalLibrary,
  postBookmark,
  createCategory,
  onClose,
}: BookmarksOverlayComponentProps) => {
  const styles = useThemedStyles(componentStyles);
  const { scale } = useAppTheme();
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const cancelCreate = () => {
    setNewTitle('');
    setIsCreating(false);
  };

  const submitCreate = () => {
    if (createCategory(newTitle)) {
      cancelCreate();
    }
  };

  const handleClose = () => {
    cancelCreate();
    onClose?.();
  };

  const renderCreate = () => (
    <DefaultFocus>
      <View style={ styles.createContainer }>
        <ThemedInput
          style={ styles.input }
          placeholder={ t('Category name') }
          onChangeText={ setNewTitle }
          maxLength={ 40 }
        />
        <SpatialNavigationView direction="horizontal">
          <View style={ styles.actions }>
            <ThemedButton onPress={ cancelCreate } contentStyle={ styles.button }>
              { t('Cancel') }
            </ThemedButton>
            <ThemedButton
              onPress={ submitCreate }
              disabled={ !newTitle.trim() }
              contentStyle={ [styles.button, styles.buttonPrimary] }
            >
              { t('Create') }
            </ThemedButton>
          </View>
        </SpatialNavigationView>
      </View>
    </DefaultFocus>
  );

  const renderList = () => (
    <>
      <ThemedMultiList
        header={ t('Bookmarks') }
        data={ items }
        onChange={ postBookmark }
        noItemsTitle={ t('No bookmarks group') }
        noItemsSubtitle={ isLocalLibrary
          ? t('Create a category to start bookmarking')
          : t('Go to site and create bookmarks group') }
      />
      { isLocalLibrary && (
        <SpatialNavigationView direction="horizontal">
          <View style={ styles.actions }>
            <ThemedButton
              IconComponent={ Plus }
              iconProps={ {
                size: scale(14),
              } }
              onPress={ () => setIsCreating(true) }
              contentStyle={ styles.button }
            >
              { t('New category') }
            </ThemedButton>
          </View>
        </SpatialNavigationView>
      ) }
    </>
  );

  return (
    <ThemedOverlay
      ref={ overlayRef }
      onClose={ handleClose }
      useKeyboardAdjustment
    >
      <Loader
        isLoading={ isLoading }
        fullScreen
      />
      { isCreating ? renderCreate() : renderList() }
    </ThemedOverlay>
  );
};

export default BookmarksOverlayComponent;
