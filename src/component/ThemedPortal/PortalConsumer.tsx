import { useCallback, useEffect, useRef } from 'react';

import type { PortalMethods } from './PortalHost';

type Props = {
  manager: PortalMethods;
  children: React.ReactNode;
};

const PortalConsumer: React.FC<Props> = ({ manager, children }) => {
  const keyRef = useRef<number | null>(null);

  const checkManager = useCallback(() => {
    if (!manager) {
      throw new Error('No portal host');
    }
  }, [manager]);

  useEffect(() => {
    checkManager();

    keyRef.current = manager.mount(children);

    return () => {
      checkManager();

      if (keyRef.current !== null) {
        manager.unmount(keyRef.current);
      }
    };
  }, []);

  useEffect(() => {
    checkManager();
    if (keyRef.current !== null) {
      manager.update(keyRef.current, children);
    }
  }, [children, manager, checkManager]);

  return null;
};

export default PortalConsumer;