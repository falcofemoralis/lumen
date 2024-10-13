import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { Text, TouchableOpacity, TVFocusGuideView, View } from 'react-native';
import AppStore from 'Store/App.store';
import FilmType from 'Type/Film.type';
import { HomePageProps } from './HomePage.type';

export type HomePageComponentType = {
  film: FilmType;
};

export function HomePageComponent(props: HomePageProps) {
  //const { film } = props;

  const Hero = () => {
    return (
      <ThemedView>
        <TVFocusGuideView autoFocus>
          <TouchableOpacity onPress={() => AppStore.setTV()}>
            <ThemedText>Play Now</ThemedText>
          </TouchableOpacity>
        </TVFocusGuideView>
      </ThemedView>
    );
  };

  const Grid = () => {
    return (
      <View>
        <TVFocusGuideView trapFocusLeft>
          <View>
            <TouchableOpacity>
              <ThemedText>1</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text>2</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text>3</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text>4</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text>5</Text>
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity>
              <Text>6</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text>7</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text>8</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text>9</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text>10</Text>
            </TouchableOpacity>
          </View>
        </TVFocusGuideView>

        <View>
          <TouchableOpacity>
            <Text>Outside Button</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={{ flex: 1, flexDirection: 'column' }}>
      <ThemedText>This is a home page</ThemedText>
      <Hero />
      <Grid />
      {/* <ThemedText>{film.info}</ThemedText> */}
      {/* <Player /> */}
    </ThemedView>
  );
}

export default HomePageComponent;
