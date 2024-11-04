import Grid from 'Component/Grid';
import ThemedView from 'Component/ThemedView';
import { HWEvent, useTVEventHandler, View } from 'react-native';
import AppStore from 'Store/App.store';
import { HomePageProps } from './HomePage.type';

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
    <ThemedView style={{ flex: 1, flexDirection: 'column', width: '100%' }}>
      {/* <Hero /> */}
      <View style={{ width: '100%' }}>
        <Grid films={films} />
      </View>
    </ThemedView>
  );
}

export default HomePageComponent;
