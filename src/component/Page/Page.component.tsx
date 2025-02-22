import ThemedView from 'Component/ThemedView';
import ErrorBoundary from 'react-native-error-boundary';

import { styles } from './Page.style';
import { PageComponentProps } from './Page.type';

export function PageComponent({
  children,
  style,
}: PageComponentProps) {
  return (
    <ThemedView
      style={ [
        styles.container,
        style,
      ] }
    >
      <ErrorBoundary>
        { children }
      </ErrorBoundary>
    </ThemedView>
  );
}

export default PageComponent;
