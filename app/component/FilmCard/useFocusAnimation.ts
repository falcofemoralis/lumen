import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export const useFocusAnimation = (isFocused: boolean) => {
  const scaleAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnimation, {
      toValue: isFocused ? 1.1 : 1,
      useNativeDriver: true,
    }).start();
  }, [isFocused, scaleAnimation]);

  return { transform: [{ scale: scaleAnimation }] };
};
