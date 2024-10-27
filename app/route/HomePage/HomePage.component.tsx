import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { router } from 'expo-router';
import {
  DimensionValue,
  HWEvent,
  TouchableOpacity,
  TVFocusGuideView,
  useTVEventHandler,
} from 'react-native';
import AppStore from 'Store/App.store';
import FilmType from 'Type/Film.type';
import { HomePageProps } from './HomePage.type';
import FilmCard from 'Component/FilmCard';

export type HomePageComponentType = {
  film: FilmType;
};

export function HomePageComponent(props: HomePageProps) {
  //const { film } = props;

  useTVEventHandler((evt: HWEvent) => {
    if (!AppStore.isInitiallyFocused) {
      AppStore.setInitiallyFocused();
    }
  });

  const films = ['qwe', 'asd', 'zxc', 'rty', 'fgh', 'vbn', 'uio', 'jkl'];

  //hasTVPreferredFocus is used to set the focus on the Play Now button
  // use tv handler to remove this focus
  const Hero = () => {
    return (
      <ThemedView>
        <TouchableOpacity
          onPress={() => router.replace('/player')}
          hasTVPreferredFocus={!AppStore.isInitiallyFocused}
        >
          <ThemedText>Play Now</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  };

  const Grid = () => {
    const numberOfColumns = 5;
    const columns: string[][] = Array.from({ length: numberOfColumns }, () => []);

    films.forEach((film, index) => {
      columns[index % numberOfColumns].push(film);
    });

    // Now group the columns into rows
    const rows: string[][] = [];
    for (let i = 0; i < columns[0].length; i++) {
      const row: string[] = [];
      for (let j = 0; j < numberOfColumns; j++) {
        if (columns[j][i] !== undefined) {
          row.push(columns[j][i]);
        }
      }
      rows.push(row);
    }

    console.log(rows);
    return (
      <ThemedView style={{ flex: 1, flexDirection: 'column', width: '100%' }}>
        {rows.map((row, index) => (
          <ThemedView
            key={index}
            style={{
              flex: 1,
              flexDirection: 'row',
              width: '100%',
            }}
          >
            {row.map((film) => (
              <TouchableOpacity
                key={film}
                style={{ width: (100 / numberOfColumns + '%') as DimensionValue }}
              >
                <FilmCard film={film} />
              </TouchableOpacity>
            ))}
          </ThemedView>
        ))}
      </ThemedView>
    );
  };

  return (
    <ThemedView style={{ flex: 1, flexDirection: 'column' }}>
      <ThemedText>This is a home page</ThemedText>
      <Hero />
      <Grid />
    </ThemedView>
  );
}

export default HomePageComponent;
