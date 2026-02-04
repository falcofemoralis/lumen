import { useConfigContext } from 'Context/ConfigContext';
import { View } from 'react-native';
import { useAppTheme } from 'Theme/context';

import { WrapperProps } from './Wrapper.type';

export const WrapperComponent = ({
  children,
  style,
}: WrapperProps) => {
  const { scale, theme } = useAppTheme();
  const { isTV } = useConfigContext();

  return (
    <View
      style={ [{
        marginHorizontal: isTV ? scale(theme.spacing.wrapperPaddingTV) : scale(theme.spacing.wrapperPadding),
      }, style] }
    >
      { children }
    </View>
  );
};

export default WrapperComponent;