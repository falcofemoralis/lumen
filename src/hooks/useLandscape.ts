import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

export const useLandscape = () => {
  const { width, height } = useWindowDimensions();

  const isLandscape = useMemo(() => width > height, [width, height]);

  return isLandscape;
};