import { RefObject, useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { findNodeHandle, Pressable, View } from 'react-native';

export let trapRefGlobal: RefObject<View | null> = { current: null };

/**
 * Whether something on screen has asked for real Android focus back.
 *
 * The trap below is unconditional by design, so anything that genuinely needs the
 * native focus engine -- a web page the user has to interact with, which draws and
 * focuses its own controls and knows nothing about the app's spatial navigation --
 * has to be able to stand it down for as long as it is up.
 */
let isTrapReleased = false;
const releaseListeners = new Set<() => void>();

function subscribeToRelease(onChange: () => void): () => void {
  releaseListeners.add(onChange);

  return () => {
    releaseListeners.delete(onChange);
  };
}

/**
 * Hands native focus over (`true`) or takes it back (`false`).
 *
 * Counted rather than a plain flag: releases can overlap, and the trap has to stay
 * down until the last one is done with it.
 */
let releaseCount = 0;

export function setNativeFocusTrapReleased(released: boolean): void {
  releaseCount = Math.max(0, releaseCount + (released ? 1 : -1));

  const next = releaseCount > 0;

  if (next === isTrapReleased) {
    return;
  }

  isTrapReleased = next;
  releaseListeners.forEach((listener) => listener());
}

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
 *
 * See {@link setNativeFocusTrapReleased} for the one case that has to undo this:
 * content the native focus engine is the only thing that can drive.
 */
export function NativeFocusTrap() {
  const trapRef = useRef<View>(null);
  const [tag, setTag] = useState<number | undefined>(undefined);
  const isReleased = useSyncExternalStore(
    subscribeToRelease,
    useCallback(() => isTrapReleased, [])
  );

  useEffect(() => {
    setTag(findNodeHandle(trapRef.current) ?? undefined);

    trapRefGlobal = trapRef;
  }, []);

  // Released, the trap stops being a focus target at all rather than merely letting
  // focus leave: still focusable, it stays the view Android hands focus back to the
  // moment whatever took it goes away mid-interaction.
  const focusTarget = isReleased ? undefined : tag;

  return (
    <Pressable
      ref={ trapRef }
      focusable={ !isReleased }
      hasTVPreferredFocus={ !isReleased }
      nextFocusUp={ focusTarget }
      nextFocusDown={ focusTarget }
      nextFocusLeft={ focusTarget }
      nextFocusRight={ focusTarget }
      style={ { position: 'absolute', width: 1, height: 1, opacity: 0 } }
    />
  );
}
