import FilmPager from 'Component/FilmPager';
import InfoBlock from 'Component/InfoBlock';
import Page from 'Component/Page';
import t from 'i18n/t';
import React from 'react';
import { View } from 'react-native';

import { styles } from './BookmarksPage.style.atv';
import { BookmarksPageThumbnail } from './BookmarksPage.thumbnail.atv';
import { BookmarksPageComponentProps } from './BookmarksPage.type';

export function BookmarksPageComponent({
  isLoading,
  menuItems,
  filmPager,
  onLoadFilms,
  onUpdateFilms,
}: BookmarksPageComponentProps) {
  const renderContent = () => {
    if (isLoading) {
      return <BookmarksPageThumbnail />;
    }

    if (!menuItems.length) {
      return (
        <View style={ styles.empty }>
          <InfoBlock
            title={ t('No bookmarks group') }
            subtitle={ t('Go to site and create bookmarks group') }
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
