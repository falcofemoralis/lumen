import ThemedView from 'Component/ThemedView';
import { PageProps } from './Page.type';

export function PageComponent(props: PageProps) {
  const { children } = props;

  return <ThemedView>{children}</ThemedView>;
}

export default PageComponent;
