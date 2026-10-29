import { ThemedButton } from 'Component/ThemedButton';
import { ThemedInput } from 'Component/ThemedInput';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedScrollView } from 'Component/ThemedScrollView';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import GripVertical from 'lucide-react-native/icons/grip-vertical';
import Plus from 'lucide-react-native/icons/plus';
import Trash2 from 'lucide-react-native/icons/trash-2';
import { useState } from 'react';
import { View } from 'react-native';
import { useAppTheme } from 'Theme/context';

import { componentStyles } from './LocalCategoriesOverlay.style.atv';
import {
  LocalCategoriesOverlayComponentProps,
  LocalCategoryRowInterface,
} from './LocalCategoriesOverlay.type';
import { LocalCategoryDragHandle, LocalCategoryDragRow } from './LocalCategoryDragRow';

const NEW_CATEGORY_FOCUS_KEY = 'LOCAL_CATEGORIES_NEW_CATEGORY';

interface LocalCategoryRowTVProps {
  category: LocalCategoryRowInterface;
  index: number;
  itemCount: number;
  categoryIds: string[];
  scale: (value: number) => number;
  styles: ReturnType<typeof componentStyles>;
  onDelete: (categoryId: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

const LocalCategoryRowTV = ({
  category,
  index,
  itemCount,
  categoryIds,
  scale,
  styles,
  onDelete,
  onReorder,
}: LocalCategoryRowTVProps) => {
  const [isMoving, setIsMoving] = useState(false);
  const { theme } = useAppTheme();

  const handleLongPress = () => {
    setIsMoving((value) => !value);
  };

  const handleArrowPress = (direction: string): boolean => {
    if (!isMoving) {
      return true;
    }

    if (direction === 'up' && index > 0) {
      onReorder(index, index - 1);

      return false;
    }

    if (direction === 'down' && index < itemCount - 1) {
      onReorder(index, index + 1);

      return false;
    }

    return false;
  };

  return (
    <LocalCategoryDragRow categoryId={ category.id } categoryIds={ categoryIds } onReorder={ onReorder }>
      <View style={ [styles.row, isMoving && styles.rowMoving] }>
        <ThemedPressable
          focusKey={ `LOCAL_CATEGORY_${category.id}` }
          onLongPress={ handleLongPress }
          onArrowPress={ handleArrowPress }
          style={ ({ isFocused }) => [styles.rowDrag, isFocused && styles.rowDragFocused] }
          contentStyle={ styles.rowDragContent }
        >
          { ({ isFocused }) => (
            <>
              <View style={ styles.rowHandle }>
                <LocalCategoryDragHandle categoryId={ category.id }>
                  <GripVertical
                    size={ scale(18) }
                    color={
                      isMoving
                        ? theme.colors.primary
                        : isFocused ? theme.colors.iconFocused : theme.colors.icon
                    }
                  />
                </LocalCategoryDragHandle>
              </View>

              <ThemedText style={ [styles.rowTitle, isFocused && styles.rowTextFocused] }>
                { category.title }
              </ThemedText>

              <ThemedText style={ [styles.rowCount, isFocused && styles.rowTextFocused] }>
                { category.count }
              </ThemedText>
            </>
          ) }
        </ThemedPressable>

        <ThemedButton
          title=""
          style={ styles.rowDelete }
          contentStyle={ styles.rowDeleteContent }
          IconComponent={ Trash2 }
          iconProps={ {
            size: scale(24),
          } }
          onPress={ () => onDelete(category.id) }
        />
      </View>
    </LocalCategoryDragRow>
  );
};

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
  reorderCategories,
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

        { categories.map((category, index) => (
          <LocalCategoryRowTV
            key={ category.id }
            category={ category }
            index={ index }
            itemCount={ categories.length }
            categoryIds={ categories.map(({ id }) => id) }
            scale={ scale }
            styles={ styles }
            onDelete={ requestDelete }
            onReorder={ reorderCategories }
          />
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
            width: scale(14),
            height: scale(14),
            style: { width: scale(14), height: scale(14), flexShrink: 0 },
          } }
          onPress={ startCreate }
          style={ styles.buttonContainer }
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
          style={ styles.buttonContainer }
          contentStyle={ styles.button }
        />

        <ThemedButton
          title={ t('Create') }
          onPress={ submitCreate }
          disabled={ isCreateDisabled }
          style={ [styles.buttonContainer, styles.buttonPrimary] }
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
          style={ styles.buttonContainer }
          contentStyle={ styles.button }
        />

        <ThemedButton
          title={ t('Accept') }
          onPress={ confirmDelete }
          style={ [styles.buttonContainer, styles.buttonPrimary] }
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
