import { NAVIGATION_BAR_TV_WIDTH } from 'Component/NavigationBar/NavigationBar.style.atv';
import { Dimensions } from 'react-native';

export const getWindowWidth = () => Dimensions.get('window').width - NAVIGATION_BAR_TV_WIDTH;
