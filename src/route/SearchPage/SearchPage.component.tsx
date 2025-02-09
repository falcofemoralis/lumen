import Page from 'Component/Page';
import React from 'react';
import { Button } from 'react-native-paper';

import { SearchPageComponentProps } from './SearchPage.type';

export function SearchPageComponent(props: SearchPageComponentProps) {
  return (
    <Page>
      <Button>Button on mobile</Button>
    </Page>
  );
}

export default SearchPageComponent;
