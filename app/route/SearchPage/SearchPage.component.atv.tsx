import Page from 'Component/Page';
import ThemedButton from 'Component/ThemedButton';
import React from 'react';
import { DefaultFocus } from 'react-tv-space-navigation';

export function SearchPageComponent() {
  return (
    <Page>
      <DefaultFocus>
        <ThemedButton>Button</ThemedButton>
      </DefaultFocus>
    </Page>
  );
}

export default SearchPageComponent;
