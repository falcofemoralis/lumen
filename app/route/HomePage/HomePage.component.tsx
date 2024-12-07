import FilmGrid from 'Component/FilmGrid';
import Page from 'Component/Page';
import React from 'react';
import { ROOT_ROUTE } from '../../navigation/_layout';
import { HomePageProps } from './HomePage.type';

export function HomePageComponent(props: HomePageProps) {
  const { films, loadFilms } = props;

  return (
    <Page name={ROOT_ROUTE}>
      <FilmGrid
        films={films}
        onNextLoad={loadFilms}
      />
    </Page>
  );
}

export default HomePageComponent;
