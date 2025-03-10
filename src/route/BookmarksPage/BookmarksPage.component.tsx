import FilmGrid from 'Component/FilmGrid';
import FilmPager from 'Component/FilmPager';
import Page from 'Component/Page';
import ThemedText from 'Component/ThemedText';
import Thumbnail from 'Component/Thumbnail';
import React from 'react';
import { View } from 'react-native';
import { scale } from 'Util/CreateStyles';

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
      return (
        <View>
          <ThemedText>Sign in</ThemedText>
        </View>
      );
    }

    if (isLoading) {
      return (
        <View style={ {
          width: '100%',
          height: '100%',
        } }
        >
          <View
            style={ {
              flexDirection: 'row',
              height: scale(24),
              gap: scale(8),
              marginBlockEnd: scale(8),
              marginBlockStart: scale(16),
            } }
          >
            { Array(3).fill(0).map((_, i) => (
              <Thumbnail
                // eslint-disable-next-line react/no-array-index-key
                key={ `${i}-thumb` }
                style={ { flex: 1 } }
              />
            )) }
          </View>
          <FilmGrid films={ [] } />
        </View>
      );
    }

    if (!menuItems.length) {
      return (
        <View>
          <ThemedText>No bookmarks</ThemedText>
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
