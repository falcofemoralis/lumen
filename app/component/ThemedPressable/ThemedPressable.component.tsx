import { forwardRef } from 'react';
import { Pressable, PressableProps, View } from 'react-native';

const ThemedPressable = forwardRef<View, PressableProps>((props, ref) => {
  const { children } = props;

  return (
    <Pressable
      {...props}
      ref={ref}
    >
      {children}
    </Pressable>
  );
});

ThemedPressable.displayName = 'ThemedPressable';

export default ThemedPressable;
