import { RefObject, useEffect, useRef, useState } from 'react';
import { findNodeHandle, Pressable, View } from 'react-native';

export let trapRefGlobal: RefObject<View | null> = { current: null };

/**
 * Parks real Android focus on an invisible 1x1 view and points every
 * nextFocus* direction back at itself, so the native focus engine can never
 * move focus onto the RNGH buttons or the ScrollView. Without this, native
 * focus travels between them on D-Pad presses and drags the list along
 * (requestChildFocus / arrowScroll). The TV props that should prevent that —
 * tvFocusable, scrollsChildToFocus, trapFocus* — are silently dropped on the
 * new architecture (missing from the C++ getDiffProps delivery), so a trap
 * built from props that do survive (focusable, hasTVPreferredFocus,
 * nextFocus*) is the only reliable option. D-Pad events still reach the
 * spatial navigation: TVEventHandler is fed during root key dispatch,
 * independent of which view holds focus.
 */
export function NativeFocusTrap() {
  const trapRef = useRef<View>(null);
  const [tag, setTag] = useState<number | undefined>(undefined);

  useEffect(() => {
    setTag(findNodeHandle(trapRef.current) ?? undefined);

    trapRefGlobal = trapRef;
  }, []);

  return (
    <Pressable
      ref={ trapRef }
      focusable
      hasTVPreferredFocus
      nextFocusUp={ tag }
      nextFocusDown={ tag }
      nextFocusLeft={ tag }
      nextFocusRight={ tag }
      style={ { position: 'absolute', width: 1, height: 1, opacity: 0 } }
    />
  );
}
