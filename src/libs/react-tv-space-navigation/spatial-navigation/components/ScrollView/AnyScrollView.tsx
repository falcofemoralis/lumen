import { forwardRef, ReactNode, RefObject } from 'react';
import { ViewStyle, ScrollView } from 'react-native';
import { CustomScrollView } from './CustomScrollView/CustomScrollView';
import { CustomScrollViewRef } from './types';

type Props = {
  useNativeScroll: boolean;

  horizontal?: boolean;
  children: ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  scrollDuration?: number;
  onScroll?: (event: { nativeEvent: { contentOffset: { y: number; x: number } } }) => void;
  testID?: string;
};

export const AnyScrollView = forwardRef<CustomScrollViewRef, Props>(
  ({ useNativeScroll, ...props }: Props, ref) => {
    if (useNativeScroll) {
      return (
        <ScrollView
          ref={ref as RefObject<ScrollView>}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          scrollEventThrottle={16}
          {...props}
        />
      );
    }

    return <CustomScrollView ref={ref} {...props} />;
  },
);

AnyScrollView.displayName = 'AnyScrollView';
