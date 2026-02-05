import { useKeyboardHandler } from 'react-native-keyboard-controller';
import Animated, { useSharedValue, withSpring } from 'react-native-reanimated';

export const KeyboardAdjuster = ({ scale = 1 }: {scale?: number}) => {
  const height = useSharedValue(0);

  useKeyboardHandler(
    {
      onStart: (e) => {
        'worklet';

        if (e.progress === 1 && e.height > 0) {
          height.value = withSpring(e.height);
        } else if (e.progress === 0 && e.height === 0) {
          height.value = withSpring(e.height);
        }
      },
    },
    []
  );

  return <Animated.View style={ { height } } />;
};

export default KeyboardAdjuster;