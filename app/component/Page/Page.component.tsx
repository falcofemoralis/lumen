import ThemedView from 'Component/ThemedView';
import { PageProps } from './Page.type';
import { styles } from './Page.style';

export function PageComponent(props: PageProps) {
  const { children, style } = props;

  return <ThemedView style={[styles.container, style]}>{children}</ThemedView>;
}

export default PageComponent;
