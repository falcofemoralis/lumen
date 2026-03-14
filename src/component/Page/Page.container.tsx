import { useConfigContext } from 'Context/ConfigContext';
import { useNetworkContext } from 'Context/NetworkContext';

import PageComponent from './Page.component';
import PageComponentTV from './Page.component.atv';
import { PageContainerProps } from './Page.type';

export function PageContainer(props: PageContainerProps) {
  const { checkConnection = true, ...restProps } = props;
  const { isTV } = useConfigContext();
  const { isInternetAvailable } = useNetworkContext();
  const isConnected = checkConnection ? isInternetAvailable : true;

  return isTV
    ? <PageComponentTV { ...restProps } isConnected={ isConnected } />
    : <PageComponent { ...restProps } isConnected={ isConnected } />;
}

export default PageContainer;
