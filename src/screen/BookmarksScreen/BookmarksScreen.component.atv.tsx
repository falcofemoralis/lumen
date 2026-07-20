import { FilmPager } from 'Component/FilmPager';
import { InfoBlock } from 'Component/InfoBlock';
import { LocalCategoriesOverlay } from 'Component/LocalCategoriesOverlay';
import { Page } from 'Component/Page';
import { ThemedButton } from 'Component/ThemedButton';
import { t } from 'i18n/translate';
import { FolderCog } from 'lucide-react-native';
import { View } from 'react-native';
import { DefaultFocus } from 'react-tv-space-navigation';
import { useAppTheme } from 'Theme/context';

import { styles } from './BookmarksScreen.style.atv';
import { BookmarksScreenThumbnail } from './BookmarksScreen.thumbnail.atv';
import { BookmarksScreenComponentProps } from './BookmarksScreen.type';

export function BookmarksScreenComponent({
  isLoading,
  pagerItems,
  isLocalLibrary,
  manageCategoriesOverlayRef,
  onLoadFilms,
  onUpdateFilms,
  openManageCategories,
}: BookmarksScreenComponentProps) {
  const { scale } = useAppTheme();

  const renderManageButton = () => (
    <ThemedButton
      IconComponent={ FolderCog }
      iconProps={ {
        size: scale(18),
      } }
      onPress={ openManageCategories }
      withAnimation
    >
      { t('Manage categories') }
    </ThemedButton>
  );

  const renderEmptyCategory = () => (
    <View style={ styles.emptyCategory }>
      <InfoBlock
        title={ t('No items') }
        subtitle={ t('Add films to this category from the film page') }
      />
    </View>
  );

  const renderContent = () => {
    if (isLoading) {
      return <BookmarksScreenThumbnail />;
    }

    if (!pagerItems.length) {
      return (
        <View style={ styles.empty }>
          <InfoBlock
            title={ t('No bookmarks group') }
            subtitle={ isLocalLibrary
              ? t('Create a category to start bookmarking')
              : t('Go to site and create bookmarks group') }
          />
          { isLocalLibrary && (
            <DefaultFocus>
              { renderManageButton() }
            </DefaultFocus>
          ) }
        </View>
      );
    }

    return (
      <View style={ styles.content }>
        { isLocalLibrary && (
          <View style={ styles.header }>
            { renderManageButton() }
          </View>
        ) }
        <FilmPager
          items={ pagerItems }
          onLoadFilms={ onLoadFilms }
          onUpdateFilms={ onUpdateFilms }
          menuDefaultFocus
          isEmpty={ isLocalLibrary }
          ListEmptyComponent={ renderEmptyCategory() }
        />
      </View>
    );
  };

  return (
    <Page>
      { renderContent() }
      { isLocalLibrary && (
        <LocalCategoriesOverlay overlayRef={ manageCategoriesOverlayRef } />
      ) }
    </Page>
  );
}

export default BookmarksScreenComponent;
