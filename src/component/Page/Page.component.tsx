import { Portal } from 'Component/ThemedPortal';
import { View } from 'react-native';

import { PageComponentProps } from './Page.type';

export function PageComponent({
  children,
  style,
}: PageComponentProps) {
  return (
    <Portal.Host>
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
    </Portal.Host>
  );
}

export default PageComponent;
