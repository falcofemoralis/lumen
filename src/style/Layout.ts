import { NAVIGATION_BAR_TV_WIDTH } from 'Component/NavigationBar/NavigationBar.style.atv';
import { Dimensions } from 'react-native';
import ConfigStore from 'Store/Config.store';
import { scale } from 'Util/CreateStyles';

export const CONTENT_WRAPPER_PADDING = scale(16);
export const CONTENT_WRAPPER_PADDING_TV = scale(16);

export const calculateLayoutWidth = (additionalWidth?: number) => {
  const { width } = Dimensions.get('window');

  const navBarWidth = ConfigStore.isTV() ? scale(NAVIGATION_BAR_TV_WIDTH) : 0;
  const paddingWidth = ConfigStore.isTV() ? CONTENT_WRAPPER_PADDING_TV : CONTENT_WRAPPER_PADDING;

  return width - (paddingWidth * 2) - navBarWidth - (additionalWidth || 0);
};

export const calculateItemWidth = (
  numberOfColumns: number,
  gap?: number,
  additionalWidth?: number
) => {
  const containerWidth = calculateLayoutWidth(additionalWidth);
  const pureGridWidth = containerWidth - ((gap || 0) * (numberOfColumns - 1));

  return pureGridWidth / numberOfColumns;
};
