import { FC, ReactNode } from 'react';

import PortalConsumer from './PortalConsumer';
import PortalHost, { PortalContext, PortalMethods } from './PortalHost';

export type Props = {
  children: ReactNode;
};

const Portal: FC<Props> & { Host: typeof PortalHost } = ({ children }) => (
  <PortalContext.Consumer>
    { (manager) => (
      <PortalConsumer manager={ manager as PortalMethods }>
        { children }
      </PortalConsumer>
    ) }
  </PortalContext.Consumer>
);

Portal.Host = PortalHost;

export default Portal;