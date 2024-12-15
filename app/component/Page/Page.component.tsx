import ThemedView from 'Component/ThemedView';
import { PageProps } from './Page.type';

export function PageComponent(props: PageProps) {
  const { children } = props;

  return (
    <ThemedView
      style={{
        height: '100%',
        width: '100%',
      }}
    >
      {children}
    </ThemedView>
  );
}

export default PageComponent;
