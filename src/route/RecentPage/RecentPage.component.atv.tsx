import Page from 'Component/Page';
import ThemedText from 'Component/ThemedText';
import React from 'react';
import { View } from 'react-native';

import { RecentPageComponentProps } from './RecentPage.type';

export function RecentPageComponent({
  isSignedIn,
  isLoading,
}: RecentPageComponentProps) {
  const renderContent = () => {
    if (!isSignedIn) {
      return (
        <View>
          <ThemedText>Sign in</ThemedText>
        </View>
      );
    }

    if (isLoading) {
      return (
        <View>
          <ThemedText>Loading...</ThemedText>
        </View>
      );
    }

    return null;

    // if (!menuItems.length) {
    //   return (
    //     <View>
    //       <ThemedText>No bookmarks</ThemedText>
    //     </View>
    //   );
    // }

    // return (
    //   <FilmPager
    //     menuItems={ menuItems }
    //     filmPager={ filmPager }
    //     onLoadFilms={ onLoadFilms }
    //     onUpdateFilms={ onUpdateFilms }
    //   />
    // );
  };

  return (
    <Page>
      { renderContent() }
    </Page>
  );
}

export default RecentPageComponent;
