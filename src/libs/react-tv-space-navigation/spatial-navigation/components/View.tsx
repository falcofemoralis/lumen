import { LayoutChangeEvent, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SpatialNavigationNode } from './Node';
import { forwardRef, ReactNode } from 'react';
import { SpatialNavigationNodeRef } from '../types/SpatialNavigationNodeRef';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  direction: 'horizontal' | 'vertical';
  alignInGrid?: boolean;
  onLayout?: ((event: LayoutChangeEvent) => void) | undefined;
};

export const SpatialNavigationView = forwardRef<SpatialNavigationNodeRef, Props>(
  ({ direction = 'horizontal', alignInGrid = false, children, style, onLayout }: Props, ref) => {
    return (
      <SpatialNavigationNode orientation={direction} alignInGrid={alignInGrid} ref={ref}>
        <View
          style={[style, direction === 'horizontal' ? styles.viewHorizontal : styles.viewVertical]}
          onLayout={onLayout}
        >
          {children}
        </View>
      </SpatialNavigationNode>
    );
  },
);
SpatialNavigationView.displayName = 'SpatialNavigationView';

const styles = StyleSheet.create({
  viewVertical: {
    display: 'flex',
    flexDirection: 'column',
  },
  viewHorizontal: {
    display: 'flex',
    flexDirection: 'row',
  },
});
