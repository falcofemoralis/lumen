import { FilmPager } from 'Component/FilmPager';
import { InfoBlock } from 'Component/InfoBlock';
import { LocalCategoriesOverlay } from 'Component/LocalCategoriesOverlay';
import { LoginForm } from 'Component/LoginForm';
import { Page } from 'Component/Page';
import { ThemedButton } from 'Component/ThemedButton';
import { useServiceContext } from 'Context/ServiceContext';
import { t } from 'i18n/translate';
import { FolderCog } from 'lucide-react-native';
import { View } from 'react-native';
import { useAppTheme } from 'Theme/context';

import { styles } from './BookmarksScreen.style.atv';
import { BookmarksScreenThumbnail } from './BookmarksScreen.thumbnail.atv';
import { BookmarksScreenComponentProps } from './BookmarksScreen.type';

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

  const renderManageButton = (autofocus = false) => (
    <ThemedButton
      title={ t('Manage categories') }
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
