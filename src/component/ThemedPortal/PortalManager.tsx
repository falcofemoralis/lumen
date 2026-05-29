import { forwardRef, ReactNode, useCallback, useImperativeHandle, useState } from 'react';
import { StyleSheet, View } from 'react-native';

type Portal = {
  key: number;
  children: ReactNode;
};

export type PortalManagerHandle = {
  mount: (key: number, children: ReactNode) => void;
  update: (key: number, children: ReactNode) => void;
  unmount: (key: number) => void;
};

const PortalManager = forwardRef<PortalManagerHandle, {}>((_, ref) => {
  const [portals, setPortals] = useState<Portal[]>([]);

  const mount = useCallback((key: number, children: ReactNode) => {
    setPortals((prev) => [...prev, { key, children }]);
  }, []);

  const update = useCallback((key: number, children: ReactNode) => {
    setPortals((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, children } : item));
  }, []);

  const unmount = useCallback((key: number) => {
    setPortals((prev) => prev.filter((item) => item.key !== key));
  }, []);

  useImperativeHandle(ref, () => ({
    mount,
    update,
    unmount,
  }));

  return (
    <>
      { portals.map(({ key, children }) => (
        <View
          key={ key }
          collapsable={ false }
          pointerEvents="box-none"
          style={ StyleSheet.absoluteFill }
        >
          { children }
        </View>
      )) }
    </>
  );
});

export default PortalManager;