import { FilmPager } from 'Component/FilmPager';
import { InfoBlock } from 'Component/InfoBlock';
import { Page } from 'Component/Page';
import { t } from 'i18n/translate';
import { View } from 'react-native';

import { styles } from './BookmarksScreen.style.atv';
import { BookmarksScreenThumbnail } from './BookmarksScreen.thumbnail.atv';
import { BookmarksScreenComponentProps } from './BookmarksScreen.type';

export function BookmarksScreenComponent({
  isLoading,
  menuItems,
  filmPager,
  onLoadFilms,
  onUpdateFilms,
}: BookmarksScreenComponentProps) {
  const renderContent = () => {
    if (isLoading) {
      return <BookmarksScreenThumbnail />;
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

export default BookmarksScreenComponent;
