import { View } from 'react-native';
import ErrorBoundary from 'react-native-error-boundary';

import { styles } from './Page.style';
import { PageComponentProps } from './Page.type';

export function PageComponent({
  children,
  style,
  disableWrapper,
}: PageComponentProps) {
  return (
    <View
      style={ !disableWrapper && [
        styles.container,
        style,
      ] }
    >
      <ErrorBoundary>
        { children }
      </ErrorBoundary>
    </View>
  );
}

export default PageComponent;
