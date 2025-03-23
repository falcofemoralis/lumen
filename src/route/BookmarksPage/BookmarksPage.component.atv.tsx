import FilmPager from 'Component/FilmPager';
import LoginForm from 'Component/LoginForm';
import Page from 'Component/Page';
import ThemedInfo from 'Component/ThemedInfo';
import t from 'i18n/t';
import React from 'react';
import { View } from 'react-native';

import { styles } from './BookmarksPage.style.atv';
import { BookmarksPageThumbnail } from './BookmarksPage.thumbnail.atv';
import { BookmarksPageComponentProps } from './BookmarksPage.type';

export function BookmarksPageComponent({
  isSignedIn,
  isLoading,
  menuItems,
  filmPager,
  onLoadFilms,
  onUpdateFilms,
}: BookmarksPageComponentProps) {
  const renderContent = () => {
    if (!isSignedIn) {
      return <LoginForm withRedirect />;
    }

    if (isLoading) {
      return <BookmarksPageThumbnail />;
    }

    if (!menuItems.length) {
      return (
        <View style={ styles.empty }>
          <ThemedInfo
            title={ t('No bookmarks') }
            subtitle={ t('You have not bookmarked any films yet') }
          />
        </View>
      );
    }

    return (
      <FilmPager
        menuItems={ menuItems }
        filmPager={ filmPager }
        onLoadFilms={ onLoadFilms }
        onUpdateFilms={ onUpdateFilms }
      />
    );
  };

  return (
    <Page>
      { renderContent() }
    </Page>
  );
}

export default BookmarksPageComponent;
