import FilmPager from 'Component/FilmPager';
import Page from 'Component/Page';
import React from 'react';
import { HomePageProps } from './HomePage.type';

export function HomePageComponent(props: HomePageProps) {
  const { menuItems, onLoadFilms } = props;

  return (
    <Page>
      <FilmPager
        menuItems={menuItems}
        onLoadFilms={onLoadFilms}
      />
    </Page>
  );
}

export default HomePageComponent;
