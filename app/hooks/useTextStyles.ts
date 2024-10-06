import { useThemeColor } from './useThemeColor';
import { useScale } from './useScale';
import { textStyles } from 'Constants/TextStyles';

export function useTextStyles() {
  const linkColor = useThemeColor({}, 'link');
  const scale = useScale() ?? 1.0;
  return textStyles(scale, linkColor);
}
