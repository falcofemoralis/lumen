import FilmPager from 'Component/FilmPager';
import Page from 'Component/Page';
import React from 'react';

import { HomePageComponentProps } from './HomePage.type';

export function HomePageComponent({
  menuItems,
  filmPager,
  onLoadFilms,
  onUpdateFilms,
}: HomePageComponentProps) {
  return (
    <Page>
      <FilmPager
        menuItems={ menuItems }
        filmPager={ filmPager }
        onLoadFilms={ onLoadFilms }
        onUpdateFilms={ onUpdateFilms }
        loadOnInit
      />
    </Page>
  );
}

export default HomePageComponent;
