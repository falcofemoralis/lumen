import { useAwake } from 'Component/Awake/useAwake';
import { useEffect } from 'react';

export const AwakeComponent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { startAwake } = useAwake();

  useEffect(() => {
    return startAwake();
  }, [startAwake]);

  return children;
};

export default AwakeComponent;