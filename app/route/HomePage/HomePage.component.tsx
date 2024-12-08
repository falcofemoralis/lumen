import FilmGrid from 'Component/FilmGrid';
import Page from 'Component/Page';
import React from 'react';
import { HomePageProps } from './HomePage.type';

export function HomePageComponent(props: HomePageProps) {
  const { films, loadFilms } = props;

  return (
    <Page>
      <FilmGrid
        films={films}
        onNextLoad={loadFilms}
      />
    </Page>
  );
}

export default HomePageComponent;
