import FilmGrid from 'Component/FilmGrid';
import Page from 'Component/Page';
import React from 'react';
import { DefaultFocus } from 'react-tv-space-navigation';
import { HomePageProps } from './HomePage.type';

export function HomePageComponent(props: HomePageProps) {
  const { films, loadFilms } = props;

  return (
    <Page testId="homePage">
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
