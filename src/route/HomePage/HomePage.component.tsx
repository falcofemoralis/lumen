import FilmPager from 'Component/FilmPager';
import Page from 'Component/Page';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import React, { useState } from 'react';
import { Button, Modal, View } from 'react-native';
import { ModalView } from 'react-native-multiple-modals';
import Animated from 'react-native-reanimated';

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
