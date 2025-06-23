import { useEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';

export const useLandscape = () => {
  const { width, height } = useWindowDimensions();
  const [isLandscape, setIsLandscape] = useState(width > height);

  useEffect(() => {
    setIsLandscape(width > height);
  }, [width, height]);

  return isLandscape;
};