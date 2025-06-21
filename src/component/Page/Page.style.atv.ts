import { NAVIGATION_BAR_TV_WIDTH, styles as navBarStyles } from 'Component/NavigationBar/NavigationBar.style.atv';
import { Dimensions, StyleSheet } from 'react-native';
import { CONTENT_WRAPPER_PADDING_TV } from 'Style/Layout';
import { scale } from 'Util/CreateStyles';

const containerWidth = Dimensions.get('window').width;

export const styles = StyleSheet.create({
  wrapper: {
    height: '100%',
    width: '100%',
  },
  container: {
    height: '100%',
    width: containerWidth - scale(NAVIGATION_BAR_TV_WIDTH) - CONTENT_WRAPPER_PADDING_TV * 2,
    marginRight: CONTENT_WRAPPER_PADDING_TV,
    marginLeft: navBarStyles.tabs.width,
    left: navBarStyles.tabs.width * -1 + CONTENT_WRAPPER_PADDING_TV,
    transitionProperty: 'marginLeft',
    transitionDuration: '250ms',
  },
  containerOpened: {
    marginLeft: navBarStyles.tabsOpened.width,
  },
  content: {
    height: '100%',
    width: '100%',
    marginTop: 16,
  },
});
