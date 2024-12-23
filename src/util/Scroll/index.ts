import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

export const isCloseToBottom = (
  event: NativeSyntheticEvent<NativeScrollEvent>,
  paddingToBottom: number,
) => {
  const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;

  return (
    layoutMeasurement.height + contentOffset.y
    >= contentSize.height - paddingToBottom
  );
};
