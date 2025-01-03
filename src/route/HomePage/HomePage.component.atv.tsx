import FilmPager from 'Component/FilmPager';
import Page from 'Component/Page';
import React from 'react';

import { HomePageComponentProps } from './HomePage.type';

export function HomePageComponent({ menuItems, onLoadFilms }: HomePageComponentProps) {
  return (
    <Page testID="home-page">
      <FilmPager
        menuItems={ menuItems }
        onLoadFilms={ onLoadFilms }
      />
    </Page>
  );
}

export default HomePageComponent;
