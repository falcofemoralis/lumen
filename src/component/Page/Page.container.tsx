import { useConfigContext } from 'Context/ConfigContext';

import PageComponent from './Page.component';
import PageComponentTV from './Page.component.atv';
import { PageContainerProps } from './Page.type';

export function PageContainer(props: PageContainerProps) {
  const { isTV } = useConfigContext();

  return isTV ? <PageComponentTV { ...props } /> : <PageComponent { ...props } />;
}

export default PageContainer;
