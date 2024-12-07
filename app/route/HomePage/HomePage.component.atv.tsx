import FilmGrid from 'Component/FilmGrid';
import Page from 'Component/Page';
import React from 'react';
import { DefaultFocus } from 'react-tv-space-navigation';
import { ROOT_ROUTE } from '../../navigation/_layout';
import { HomePageProps } from './HomePage.type';

export function HomePageComponent(props: HomePageProps) {
  const { films, loadFilms } = props;

  console.log('HomePageComponent');

  return (
    <Page name={ROOT_ROUTE}>
      <DefaultFocus>
        <FilmGrid
          films={films}
          onNextLoad={loadFilms}
        />
      </DefaultFocus>
    </Page>
  );
}

export default HomePageComponent;
