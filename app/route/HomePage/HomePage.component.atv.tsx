import Grid from 'Component/Grid';
import Page from 'Component/Page';
import React from 'react';
import { DefaultFocus } from 'react-tv-space-navigation';
import { HomePageProps } from './HomePage.type';
import { ROOT_ROUTE } from '../../navigation/_layout';

export function HomePageComponent(props: HomePageProps) {
  const { films, onScrollEnd } = props;

  return (
    <Page name={ROOT_ROUTE}>
      <DefaultFocus>
        <Grid
          films={films}
          onScrollEnd={onScrollEnd}
        />
      </DefaultFocus>
    </Page>
  );
}

export default HomePageComponent;
