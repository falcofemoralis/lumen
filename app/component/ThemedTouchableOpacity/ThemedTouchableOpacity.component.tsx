import { forwardRef } from 'react';
import { TouchableOpacity, TouchableOpacityProps, View } from 'react-native';

const ThemedTouchableOpacity = forwardRef<View, TouchableOpacityProps>((props, ref) => {
  const { children } = props;

  return (
    <TouchableOpacity
      {...props}
      ref={ref}
      // TODO Check if bug was fixed
      hasTVPreferredFocus={false}
    >
      {children}
    </TouchableOpacity>
  );
});

ThemedTouchableOpacity.displayName = 'ThemedTouchableOpacity';

export default ThemedTouchableOpacity;
