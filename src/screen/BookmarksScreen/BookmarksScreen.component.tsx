import { FilmPager } from 'Component/FilmPager';
import { InfoBlock } from 'Component/InfoBlock';
import { LocalCategoriesOverlay } from 'Component/LocalCategoriesOverlay';
import { LoginForm } from 'Component/LoginForm';
import { Page } from 'Component/Page';
import { ThemedButton } from 'Component/ThemedButton';
import { useServiceContext } from 'Context/ServiceContext';
import { t } from 'i18n/translate';
import FolderCog from 'lucide-react-native/icons/folder-cog';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from 'Theme/context';

import { styles } from './BookmarksScreen.style';
import { BookmarksScreenThumbnail } from './BookmarksScreen.thumbnail';
import { BookmarksScreenComponentProps } from './BookmarksScreen.type';

export function BookmarksScreenComponent({
  isLoading,
  isLocalLibrary,
  manageCategoriesOverlayRef,
  openManageCategories,
  pagerItems,
  ...pagerHandlers
}: BookmarksScreenComponentProps) {
  const { top } = useSafeAreaInsets();
  const { scale, theme } = useAppTheme();
  const { isSignedIn } = useServiceContext();

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
      return <LoginForm />;
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
          { isLocalLibrary && (
            <ThemedButton
              title={ t('Manage categories') }
              IconComponent={ FolderCog }
              iconProps={ {
                size: scale(18),
                color: theme.colors.text,
              } }
              onPress={ openManageCategories }
            />
          ) }
        </View>
      );
    }

    return (
      <View style={ styles.content }>
        { isLocalLibrary && (
          <View style={ [styles.header, { paddingTop: top + scale(4) }] }>
            <ThemedButton
              style={ styles.manageButton }
              contentStyle={ styles.manageButtonContent }
              IconComponent={ FolderCog }
              iconProps={ {
                size: scale(20),
                color: theme.colors.text,
              } }
              onPress={ openManageCategories }
            />
          </View>
        ) }
        <FilmPager
          { ...pagerHandlers }
          pagerItems={ pagerItems }
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
