import { useKeyboardHandler } from 'react-native-keyboard-controller';
import { useSharedValue } from 'react-native-reanimated';

export const useGradualAnimation = () => {
  const totalOffset = 0;

  const height = useSharedValue(totalOffset);

  useKeyboardHandler(
    {
      onMove: (e) => {
        'worklet';
        height.value =
          e.height > 0 ? Math.max(e.height, totalOffset) : totalOffset;
      },
    },
    []
  );

  return { height };
};