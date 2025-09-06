import { NAVIGATION_BAR_TV_WIDTH } from 'Component/NavigationBar/NavigationBar.style.atv';
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
    marginInline: CONTENT_WRAPPER_PADDING_TV,
    transform: [{ translateX: 0 }],
    transitionProperty: 'transform',
    transitionDuration: '250ms',
    transitionTimingFunction: 'ease-in-out',
  },
  containerOpened: {
    transform: [{ translateX: scale(NAVIGATION_BAR_TV_WIDTH + CONTENT_WRAPPER_PADDING_TV) }],
  },
  content: {
    height: '100%',
    width: '100%',
    marginTop: 16,
  },
});
