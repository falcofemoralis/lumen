import { createContext, useCallback, useRef } from 'react';
import { View } from 'react-native';

import PortalManager, { PortalManagerHandle } from './PortalManager';

export type Props = {
  children: React.ReactNode;
};

type Operation =
  | { type: 'mount'; key: number; children: React.ReactNode }
  | { type: 'update'; key: number; children: React.ReactNode }
  | { type: 'unmount'; key: number };

export type PortalMethods = {
  mount: (children: React.ReactNode) => number;
  update: (key: number, children: React.ReactNode) => void;
  unmount: (key: number) => void;
};

export const PortalContext = createContext<PortalMethods>(null as any);

const PortalHost: React.FC<Props> = ({ children }) => {
  const managerRef = useRef<PortalManagerHandle | null>(null);
  const queueRef = useRef<Operation[]>([]);
  const nextKeyRef = useRef(0);

  const setManager = useCallback((manager: PortalManagerHandle | null) => {
    managerRef.current = manager;

    if (manager && queueRef.current.length) {
      let action: Operation | undefined;
      while ((action = queueRef.current.pop())) {
        switch (action.type) {
          case 'mount':
            manager.mount(action.key, action.children);
            break;
          case 'update':
            manager.update(action.key, action.children);
            break;
          case 'unmount':
            manager.unmount(action.key);
            break;
        }
      }
    }
  }, []);

  const mount = useCallback((el: React.ReactNode) => {
    const key = nextKeyRef.current++;
    if (managerRef.current) {
      managerRef.current.mount(key, el);
    } else {
      queueRef.current.push({ type: 'mount', key, children: el });
    }

    return key;
  }, []);

  const update = useCallback((key: number, el: React.ReactNode) => {
    if (managerRef.current) {
      managerRef.current.update(key, el);
    } else {
      const op: Operation = { type: 'mount', key, children: el };
      const index = queueRef.current.findIndex(
        (o) => o.type === 'mount' || (o.type === 'update' && o.key === key)
      );
      if (index > -1) {
        queueRef.current[index] = op;
      } else {
        queueRef.current.push(op as Operation);
      }
    }
  }, []);

  const unmount = useCallback((key: number) => {
    if (managerRef.current) {
      managerRef.current.unmount(key);
    } else {
      queueRef.current.push({ type: 'unmount', key });
    }
  }, []);

  return (
    <PortalContext.Provider
      value={ {
        mount,
        update,
        unmount,
      } }
    >
      <View
        style={ { flex: 1 } }
        collapsable={ false }
        pointerEvents="box-none"
      >
        { children }
      </View>
      <PortalManager ref={ setManager } />
    </PortalContext.Provider>
  );
};

(PortalHost as any).displayName = 'Portal.Host';

export default PortalHost;
