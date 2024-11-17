import Grid from 'Component/Grid';
import ThemedView from 'Component/ThemedView';
import { HWEvent, useTVEventHandler, View } from 'react-native';
import { HomePageProps } from './HomePage.type';

export function HomePageComponent(props: HomePageProps) {
  const { films } = props;

  useTVEventHandler((evt: HWEvent) => {});

  return (
    <ThemedView style={{ flex: 1, flexDirection: 'column', width: '100%' }}>
      <View style={{ width: '100%' }}>
        <Grid films={films} />
      </View>
    </ThemedView>
  );
}

export default HomePageComponent;
