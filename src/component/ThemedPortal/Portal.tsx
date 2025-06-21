import PortalConsumer from './PortalConsumer';
import PortalHost, { PortalContext, PortalMethods } from './PortalHost';

export type Props = {
  children: React.ReactNode;
};

const Portal: React.FC<Props> & { Host: typeof PortalHost } = ({ children }) => (
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