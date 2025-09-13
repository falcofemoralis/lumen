import { createNavigationContainerRef, NavigationContainer, Theme } from '@react-navigation/native';
import * as Linking from 'expo-linking';

export const navigationRef = createNavigationContainerRef();

const prefix = Linking.createURL('/');

export const Navigation = ({
  children,
  theme,
  onReady,
}: {
  children: React.ReactNode;
  theme: Theme;
  onReady: () => void;
}) => {
  return (
    <NavigationContainer
      ref={ navigationRef }
      theme={ theme }
      linking={ {
        prefixes: [prefix],
      } }
      onReady={ () => {
        onReady();
      } }
    >
      { children }
    </NavigationContainer>
  );
};