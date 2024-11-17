import { forwardRef } from 'react';
import { Pressable, PressableProps, View } from 'react-native';

const ThemedPressable = forwardRef<View, PressableProps>((props, ref) => {
  const { children } = props;

  return (
    <Pressable
      {...props}
      ref={ref}
      // TODO Check if bug was fixed
      hasTVPreferredFocus={false}
    >
      {children}
    </Pressable>
  );
});

ThemedPressable.displayName = 'ThemedPressable';

export default ThemedPressable;
