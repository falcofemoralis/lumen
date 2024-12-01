import { withTV } from 'Hooks/withTV';
import PageComponent from './Page.component';
import PageComponentTV from './Page.component.atv';
import { PageProps } from './Page.type';

export function PageContainer(props: PageProps) {
  return withTV(PageComponentTV, PageComponent, props);
}

export default PageContainer;
