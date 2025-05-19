import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export const useFocusAnimation = (isFocused: boolean) => {
  const scaleAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnimation, {
      toValue: isFocused ? 1.1 : 1,
      useNativeDriver: true,
      speed: 6,
      bounciness: 0,
    }).start();
  }, [isFocused, scaleAnimation]);

  return { transform: [{ scale: scaleAnimation }] };
};
