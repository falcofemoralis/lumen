import { ThemedButton } from 'Component/ThemedButton';
import { ThemedInput } from 'Component/ThemedInput';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import GripVertical from 'lucide-react-native/icons/grip-vertical';
import Plus from 'lucide-react-native/icons/plus';
import Trash2 from 'lucide-react-native/icons/trash-2';
import { ScrollView, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useAppTheme } from 'Theme/context';

import { componentStyles } from './LocalCategoriesOverlay.style';
import {
  LocalCategoriesOverlayComponentProps,
  LocalCategoryRowInterface,
} from './LocalCategoriesOverlay.type';
import { LocalCategoryDragHandle, LocalCategoryDragRow } from './LocalCategoryDragRow';

interface LocalCategoryRowProps {
  category: LocalCategoryRowInterface;
  index: number;
  itemCount: number;
  categoryIds: string[];
  scale: (value: number) => number;
  textColor: string;
  movingColor: string;
  styles: ReturnType<typeof componentStyles>;
  onDelete: (categoryId: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

const LocalCategoryRow = ({
  category,
  index,
  itemCount,
  categoryIds,
  scale,
  textColor,
  movingColor,
  styles,
  onDelete,
  onReorder,
}: LocalCategoryRowProps) => {
  const translationY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const rowHeight = useSharedValue(0);

  const handleDrop = (
    fromIndex: number,
    translation: number,
    height: number,
  ) => {
    if (height <= 0) {
      return;
    }

    const offset = Math.round(translation / height);
    const toIndex = Math.max(
      0,
      Math.min(fromIndex + offset, itemCount - 1),
    );

    if (toIndex !== fromIndex) {
      onReorder(fromIndex, toIndex);
    }
  };

  const gesture = Gesture.Pan()
    .activateAfterLongPress(250)
    .onBegin(() => {
      isDragging.value = true;
    })
    .onUpdate((event) => {
      translationY.value = event.translationY;
    })
    .onEnd(() => {
      runOnJS(handleDrop)(
        index,
        translationY.value,
        rowHeight.value,
      );
    })
    .onFinalize(() => {
      translationY.value = 0;
      isDragging.value = false;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: isDragging.value
      ? movingColor
      : 'transparent',
    transform: [
      {
        translateY: translationY.value,
      },
    ],
    zIndex: isDragging.value ? 1 : 0,
  }));

  return (
    <LocalCategoryDragRow categoryId={ category.id } categoryIds={ categoryIds } onReorder={ onReorder }>
      <Animated.View
        style={ [styles.row, styles.rowMoving, animatedStyle] }
        onLayout={ (event) => {
          rowHeight.value = event.nativeEvent.layout.height;
        } }
      >
        <GestureDetector gesture={ gesture }>
          <View style={ styles.rowDragContent }>
            <View style={ styles.rowHandle }>
              <LocalCategoryDragHandle categoryId={ category.id }>
                <GripVertical
                  size={ scale(18) }
                  color={ textColor }
                />
              </LocalCategoryDragHandle>
            </View>

            <ThemedText style={ styles.rowTitle }>
              { category.title }
            </ThemedText>

            <ThemedText style={ styles.rowCount }>
              { category.count }
            </ThemedText>
          </View>
        </GestureDetector>

        <ThemedButton
          style={ styles.rowDelete }
          contentStyle={ styles.rowDeleteContent }
          IconComponent={ Trash2 }
          iconProps={ {
            size: scale(24),
            color: textColor,
          } }
          onPress={ () => onDelete(category.id) }
        />
      </Animated.View>
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
  const { scale, theme } = useAppTheme();

  const renderList = () => (
    <>
      <ScrollView style={ styles.list }>
        { !categories.length && (
          <ThemedText style={ styles.emptyText }>
            { t('No bookmarks group') }
          </ThemedText>
        ) }

        { categories.map((category, index) => (
          <LocalCategoryRow
            key={ category.id }
            category={ category }
            index={ index }
            itemCount={ categories.length }
            categoryIds={ categories.map(({ id }) => id) }
            scale={ scale }
            textColor={ theme.colors.text }
            movingColor={ theme.colors.primary }
            styles={ styles }
            onDelete={ requestDelete }
            onReorder={ reorderCategories }
          />
        )) }
      </ScrollView>

      <View style={ styles.actions }>
        <ThemedButton
          title={ t('New category') }
          IconComponent={ Plus }
          iconProps={ {
            size: scale(16),
            color: theme.colors.text,
          } }
          onPress={ startCreate }
          style={ styles.button }
          contentStyle={ styles.buttonContent }
        />
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
        <ThemedButton
          title={ t('Cancel') }
          onPress={ cancelCreate }
          style={ styles.button }
          contentStyle={ styles.buttonContent }
        />

        <ThemedButton
          title={ t('Create') }
          onPress={ submitCreate }
          disabled={ isCreateDisabled }
          style={ [styles.button, styles.buttonPrimary] }
          contentStyle={ styles.buttonContent }
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
          onPress={ cancelDelete }
          style={ styles.button }
          contentStyle={ styles.buttonContent }
        />

        <ThemedButton
          title={ t('Accept') }
          onPress={ confirmDelete }
          style={ [styles.button, styles.buttonPrimary] }
          contentStyle={ styles.buttonContent }
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
