import { useIsTV } from 'Context/ConfigContext';
import { useNetworkContext } from 'Context/NetworkContext';

import PageComponent from './Page.component';
import PageComponentTV from './Page.component.atv';
import { PageContainerProps } from './Page.type';

export function PageContainer(props: PageContainerProps) {
  const { checkConnection = true, ...restProps } = props;
  const isTV = useIsTV();
  const { isOffline } = useNetworkContext();

  // only a known-offline state blocks the page: while the first network reading is still
  // pending the screen keeps rendering, with its queries parked until the state is known
  const isConnected = checkConnection ? !isOffline : true;

  const containerProps = {
    isConnected,
    ...restProps,
  };

  return isTV ? <PageComponentTV { ...containerProps } /> : <PageComponent { ...containerProps } />;
}

export default PageContainer;
