import Grid from 'Component/Grid';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { router } from 'expo-router';
import { HWEvent, TouchableOpacity, useTVEventHandler } from 'react-native';
import AppStore from 'Store/App.store';
import Film from 'Type/Film.interface';
import { HomePageProps } from './HomePage.type';

export type HomePageComponentType = {
  film: Film;
};

export function HomePageComponent(props: HomePageProps) {
  const { films } = props;

  useTVEventHandler((evt: HWEvent) => {
    if (!AppStore.isInitiallyFocused) {
      AppStore.setInitiallyFocused();
    }
  });

  // //hasTVPreferredFocus is used to set the focus on the Play Now button
  // // use tv handler to remove this focus
  // const Hero = () => {
  //   return (
  //     <ThemedView>
  //       <TouchableOpacity
  //         onPress={() => router.replace('/player')}
  //         hasTVPreferredFocus={!AppStore.isInitiallyFocused}
  //       >
  //         <ThemedText>Play Now</ThemedText>
  //       </TouchableOpacity>
  //     </ThemedView>
  //   );
  // };

  return (
    <ThemedView style={{ flex: 1, flexDirection: 'column' }}>
      {/* <Hero /> */}
      <Grid films={films} />
    </ThemedView>
  );
}

export default HomePageComponent;
