import { Dimensions } from 'react-native';
import ConfigStore from 'Store/Config.store';
import { scale } from 'Util/CreateStyles';

export const CONTENT_WRAPPER_PADDING = scale(16);
export const CONTENT_WRAPPER_PADDING_TV = scale(32);

export const calculateItemSize = (numberOfColumns: number, gap: number|undefined = 0) => {
  const { width } = Dimensions.get('window');

  // width - edge padding - grid gaps
  const gridWidth = width
    - (ConfigStore.isTV ? CONTENT_WRAPPER_PADDING_TV : CONTENT_WRAPPER_PADDING * 2)
    - (scale(gap) * (numberOfColumns - 1));

  return gridWidth / numberOfColumns;
};
