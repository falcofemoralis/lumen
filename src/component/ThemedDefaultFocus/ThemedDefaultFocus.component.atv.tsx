import { useDefaultFocus } from 'Hooks/useDefaultFocus';

import { ThemedDefaultFocusProps } from './ThemedDefaultFocus.type';

/**
 * Declarative default-focus marker: drop it inside a screen and point it at the
 * focusKey that should receive focus when the screen loads or is returned to.
 * Renders nothing.
 */
export function ThemedDefaultFocusComponent({ focusKey, enabled = true }: ThemedDefaultFocusProps) {
  useDefaultFocus(focusKey, enabled);

  return null;
}

export default ThemedDefaultFocusComponent;
