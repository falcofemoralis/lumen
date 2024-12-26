import ThemedView from 'Component/ThemedView';
import { observer } from 'mobx-react-lite';
import NavigationStore from 'Store/Navigation.store';

import { styles } from './Page.style';
import { PageComponentProps } from './Page.type';

export function PageComponent({
  children,
  style,
}: PageComponentProps) {
  return (
    <ThemedView style={ [
      styles.container,
      NavigationStore.isNavigationLocked && styles.fullContainer,
      style,
    ] }
    >
      { children }
    </ThemedView>
  );
}

export default observer(PageComponent);
