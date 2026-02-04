import { View } from 'react-native';

import { PageComponentProps } from './Page.type';

export function PageComponent({
  children,
  style,
}: PageComponentProps) {
  return (
    <View
      style={ [
        {
          height: '100%',
          width: '100%',
        },
        style,
      ] }
    >
      { children }
    </View>
  );
}

export default PageComponent;
