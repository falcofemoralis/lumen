import { FocusHandler } from '@noriginmedia/norigin-spatial-navigation-react-native-tvos';
import { createContext, use } from 'react';

interface ScrollContextInterface {
  scrollTo: FocusHandler<any>;
}

export const ScrollContext = createContext<ScrollContextInterface>({
  scrollTo: () => {},
});

export const useScrollContext = () => use(ScrollContext);