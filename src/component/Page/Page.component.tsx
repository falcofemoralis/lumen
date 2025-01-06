import ThemedView from 'Component/ThemedView';

import { styles } from './Page.style';
import { PageComponentProps } from './Page.type';

export function PageComponent({
  children,
  style,
}: PageComponentProps) {
  return (
    <ThemedView style={ [
      styles.container,
      style,
    ] }
    >
      { children }
    </ThemedView>
  );
}

export default PageComponent;
