import { NAVIGATION_BAR_TV_WIDTH } from 'Component/NavigationBar/NavigationBar.style.atv';
import { Dimensions } from 'react-native';
import { scale } from 'Util/CreateStyles';

export const getWindowWidth = () => Dimensions.get('window').width - scale(NAVIGATION_BAR_TV_WIDTH);
