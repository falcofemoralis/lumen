import { forwardRef, useEffect, useState } from 'react';
import { Pressable, PressableProps, View } from 'react-native';

type ThemedPressableProps = PressableProps & {
  alwaysFocus?: boolean;
};

const ThemedPressable = forwardRef<View, ThemedPressableProps>((props, ref) => {
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
    <Pressable
      {...props}
      ref={ref}
      // TODO Check if bug was fixed
      hasTVPreferredFocus={hasTVPreferredFocus}
    >
      {children}
    </Pressable>
  );
});

ThemedPressable.displayName = 'ThemedPressable';

export default ThemedPressable;
