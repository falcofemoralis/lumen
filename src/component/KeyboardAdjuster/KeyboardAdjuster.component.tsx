import { useKeyboardHandler } from 'react-native-keyboard-controller';
import Animated, { useSharedValue, withSpring } from 'react-native-reanimated';

export const KeyboardAdjuster = ({ scale = 1, isActive = true }: {
  scale?: number
  isActive?: boolean
}) => {
  const height = useSharedValue(0);

  useKeyboardHandler(
    {
      onStart: (e) => {
        'worklet';

        if (!isActive) {
          height.value = withSpring(0);

          return;
        }

        if (e.progress === 1 && e.height > 0) {
          height.value = withSpring(e.height * scale);
        } else if (e.progress === 0 && e.height === 0) {
          height.value = withSpring(e.height * scale);
        }
      },
    },
    [isActive]
  );

  return <Animated.View style={ { height } } />;
};

export default KeyboardAdjuster;