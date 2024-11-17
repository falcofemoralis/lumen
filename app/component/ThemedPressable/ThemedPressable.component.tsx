import { forwardRef, useEffect, useState } from 'react';
import { Pressable, PressableProps, View } from 'react-native';

const ThemedPressable = forwardRef<View, PressableProps>((props, ref) => {
  const { hasTVPreferredFocus: hasTVPreferredFocusProps = false, children } = props;
  // const [hasTVPreferredFocus, setHasTVPreferredFocus] = useState(hasTVPreferredFocusProps);

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (hasTVPreferredFocus) {
  //       setHasTVPreferredFocus((previousFocus) => !previousFocus);
  //     }
  //   }, 1000);

  //   return () => clearTimeout(timer);
  // }, []);

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
