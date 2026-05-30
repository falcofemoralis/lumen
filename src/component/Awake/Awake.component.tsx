import { useAwake } from 'Component/Awake/useAwake';
import { ReactNode, useEffect } from 'react';

export const AwakeComponent = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { startAwake } = useAwake();

  useEffect(() => {
    return startAwake();
  }, [startAwake]);

  return children;
};

export default AwakeComponent;