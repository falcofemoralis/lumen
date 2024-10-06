import ThemedText from "Component/ThemedText";
import ThemedView from "Component/ThemedView";
import FilmType from "Type/Film.type";
import { HomePageProps } from "./HomePage.type";

export type HomePageComponentType = {
  film: FilmType;
};

export function HomePageComponent(props: HomePageProps) {
  const { film } = props;

  return (
    <ThemedView>
      <ThemedText>Home</ThemedText>
      <ThemedText>{film.info}</ThemedText>
    </ThemedView>
  );
}

export default HomePageComponent;
