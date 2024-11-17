import { forwardRef, useEffect, useState } from 'react';
import { TouchableOpacity, TouchableOpacityProps, View } from 'react-native';

const ThemedTouchableOpacity = forwardRef<View, TouchableOpacityProps>((props, ref) => {
  const { hasTVPreferredFocus: hasTVPreferredFocusProps, children } = props;
  // const [hasTVPreferredFocus, setHasTVPreferredFocus] = useState(hasTVPreferredFocusProps);

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setHasTVPreferredFocus((previousFocus) => !previousFocus);
  //   }, 1000);

  //   return () => clearTimeout(timer);
  // }, []);

  return (
    <TouchableOpacity
      {...props}
      ref={ref}
    >
      {children}
    </TouchableOpacity>
  );
});

ThemedTouchableOpacity.displayName = 'ThemedTouchableOpacity';

export default ThemedTouchableOpacity;
