import { useGradualAnimation } from 'Hooks/useGradualAnimation';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

export const KeyboardAdjuster = ({ scale = 1 }: {scale?: number}) => {
  const { height } = useGradualAnimation();

  const keyboardPadding = useAnimatedStyle(() => {
    return {
      height: height.value > 0 ? height.value / scale : 0,
    };
  }, []);

  return <Animated.View style={ keyboardPadding } />;
};

export default KeyboardAdjuster;