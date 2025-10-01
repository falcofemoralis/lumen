import FilmPager from 'Component/FilmPager';
import InfoBlock from 'Component/InfoBlock';
import Page from 'Component/Page';
import t from 'i18n/t';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { styles } from './BookmarksPage.style';
import { BookmarksPageThumbnail } from './BookmarksPage.thumbnail';
import { BookmarksPageComponentProps } from './BookmarksPage.type';

export function BookmarksPageComponent({
  isLoading,
  menuItems,
  filmPager,
  onLoadFilms,
  onUpdateFilms,
}: BookmarksPageComponentProps) {
  const { top } = useSafeAreaInsets();

  const renderContent = () => {
    if (isLoading) {
      return <BookmarksPageThumbnail top={ top } />;
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
