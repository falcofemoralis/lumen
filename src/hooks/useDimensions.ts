import { useEffect, useState } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

const { width: w, height: h } = Dimensions.get('window');

export const useDimensions = () => {
  const [width, setWidth] = useState(w);
  const [height, setHeight] = useState(h);

  const updateDimensions = (args?: { window: ScaledSize }) => {
    const { window } = args ?? {};
    const { width: ww, height: hh } = window ?? Dimensions.get('window');

    setWidth(ww);
    setHeight(hh);
  };

  useEffect(() => {
    const dimensionChangeHandler = Dimensions.addEventListener('change', updateDimensions);

    return () => {
      dimensionChangeHandler.remove();
    };
  }, []);

  return { width, height };
};
