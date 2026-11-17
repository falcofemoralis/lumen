import { InfoBlock } from 'Component/InfoBlock';
import { Loader } from 'Component/Loader';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedInput } from 'Component/ThemedInput';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedText } from 'Component/ThemedText';
import { t } from 'i18n/translate';
import Plus from 'lucide-react-native/icons/plus';
import Square from 'lucide-react-native/icons/square';
import SquareCheck from 'lucide-react-native/icons/square-check';
import { useState } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { useAppTheme } from 'Theme/context';

import { BookmarksOverlayComponentProps } from './BookmarksOverlay.type';

export default function BookmarksOverlayComponent({
  overlayRef, items, isLoading, isLocalLibrary, postBookmark, createCategory, onClose,
}: BookmarksOverlayComponentProps) {
  const { scale, theme } = useAppTheme();
  const { width, height } = useWindowDimensions();
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const cancel = () => { setTitle(''); setIsCreating(false); };
  const close = () => { cancel(); onClose?.(); };
  const create = () => { if (title.trim() && createCategory(title.trim())) cancel(); };
  const rowContent = { height: scale(48), paddingHorizontal: scale(12), gap: scale(12) };

  return (
    <ThemedOverlay
      ref={ overlayRef }
      onClose={ close }
      contentContainerStyle={ {
        width: Math.min(scale(420), width - 48), maxWidth: '100%', maxHeight: height - 64,
        padding: scale(12), gap: scale(8),
      } }
    >
      <View nativeID="lumen-bookmarks-panel" style={ { gap: scale(8), flexShrink: 1 } }>
        <ThemedText style={ { textAlign: 'center', padding: scale(8), fontWeight: '500' } }>
          { t('Bookmarks') }
        </ThemedText>
        { isCreating ? (
          <View style={ { gap: scale(12) } }>
            <ThemedInput
              autofocus
              value={ title }
              placeholder={ t('Category name') }
              onChangeText={ setTitle }
              maxLength={ 40 }
              onSubmitEditing={ create }
            />
            <View style={ { flexDirection: 'row', gap: scale(8), justifyContent: 'flex-end' } }>
              <ThemedButton title={ t('Cancel') } onPress={ cancel } />
              <ThemedButton title={ t('Create') } onPress={ create } disabled={ !title.trim() } />
            </View>
          </View>
        ) : (
          <>
            <ScrollView style={ { maxHeight: Math.max(48, height - 240), flexShrink: 1 } }>
              { items.length ? items.map(item => (
                <ThemedButton
                  key={ item.value }
                  title={ item.label }
                  onPress={ () => { if (!isLoading) postBookmark(item.value, !item.isChecked); } }
                  contentStyle={ rowContent }
                  textStyle={ { flex: 1, textAlign: 'left' } }
                  rightAdditionalElement={ (isFocused) => item.isChecked ? (
                    <SquareCheck size={ scale(20) } color={ theme.colors.secondary } />
                  ) : <Square size={ scale(20) } color={ isFocused ? theme.colors.iconFocused : theme.colors.icon } /> }
                />
              )) : (
                <InfoBlock
                  title={ t('No bookmarks group') }
                  subtitle={ isLocalLibrary
                    ? t('Create a category to start bookmarking') : t('Go to site and create bookmarks group') }
                  hideIcon
                />
              ) }
            </ScrollView>
            { isLoading && <Loader size="small" /> }
            { isLocalLibrary && (
              <ThemedButton
                title={ t('New category') }
                IconComponent={ Plus }
                iconProps={ { size: scale(20) } }
                onPress={ () => setIsCreating(true) }
                contentStyle={ rowContent }
              />
            ) }
          </>
        ) }
      </View>
    </ThemedOverlay>
  );
}