import { forwardRef, useEffect, useState } from 'react';
import { TouchableOpacity, TouchableOpacityProps, View } from 'react-native';

type ThemedTouchableOpacityProps = TouchableOpacityProps & {
  alwaysFocus?: boolean;
};

const ThemedTouchableOpacity = forwardRef<View, ThemedTouchableOpacityProps>((props, ref) => {
  const {
    children,
    hasTVPreferredFocus: hasTVPreferredFocusProp = false,
    alwaysFocus = false,
  } = props;

  const [hasTVPreferredFocus, setHasTVPreferredFocus] = useState(hasTVPreferredFocusProp);

  useEffect(() => {
    if (alwaysFocus) {
      setHasTVPreferredFocus(true);
    } else {
      setHasTVPreferredFocus(hasTVPreferredFocusProp);
    }

    const timer = setTimeout(() => {
      if (hasTVPreferredFocusProp) {
        setHasTVPreferredFocus(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [hasTVPreferredFocusProp, alwaysFocus]);

  return (
    <TouchableOpacity
      {...props}
      ref={ref}
      // TODO Check if bug was fixed
      hasTVPreferredFocus={hasTVPreferredFocus}
    >
      {children}
    </TouchableOpacity>
  );
});

ThemedTouchableOpacity.displayName = 'ThemedTouchableOpacity';

export default ThemedTouchableOpacity;
