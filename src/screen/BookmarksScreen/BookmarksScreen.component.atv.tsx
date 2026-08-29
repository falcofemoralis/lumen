import { FilmPager } from 'Component/FilmPager';
import { InfoBlock } from 'Component/InfoBlock';
import { LocalCategoriesOverlay } from 'Component/LocalCategoriesOverlay';
import { LoginForm } from 'Component/LoginForm';
import { Page } from 'Component/Page';
import { ThemedButton } from 'Component/ThemedButton';
import { useServiceContext } from 'Context/ServiceContext';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import FolderCog from 'lucide-react-native/icons/folder-cog';
import { View } from 'react-native';
import { useAppTheme } from 'Theme/context';

import { componentStyles } from './BookmarksScreen.style.atv';
import { BookmarksScreenThumbnail } from './BookmarksScreen.thumbnail.atv';
import { BookmarksScreenComponentProps } from './BookmarksScreen.type';

// One key for both placements of the button -- they are mutually exclusive
// branches, so it is never registered twice, and closing the overlay after the
// first category was created restores focus to whichever one is now mounted
// (the empty state's button is gone by then, the header's has taken its place).
const MANAGE_CATEGORIES_FOCUS_KEY = 'BOOKMARKS_MANAGE_CATEGORIES';

export function BookmarksScreenComponent({
  isLoading,
  isLocalLibrary,
  manageCategoriesOverlayRef,
  openManageCategories,
  pagerItems,
  ...pagerHandlers
}: BookmarksScreenComponentProps) {
  const { scale } = useAppTheme();
  const { isSignedIn } = useServiceContext();
  const styles = useThemedStyles(componentStyles);

  const renderManageButton = (autofocus = false) => (
    <ThemedButton
      title={ t('Manage categories') }
      focusKey={ MANAGE_CATEGORIES_FOCUS_KEY }
      autofocus={ autofocus }
      IconComponent={ FolderCog }
      iconProps={ {
        size: scale(18),
      } }
      onPress={ openManageCategories }
    />
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
    if (!isSignedIn && !isLocalLibrary) {
      return <LoginForm autofocus />;
    }

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
          { isLocalLibrary && renderManageButton(true) }
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
          { ...pagerHandlers }
          pagerItems={ pagerItems }
          isEmpty={ isLocalLibrary }
          ListEmptyComponent={ renderEmptyCategory() }
          centerEmptyComponent
          menuDefaultFocus
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
