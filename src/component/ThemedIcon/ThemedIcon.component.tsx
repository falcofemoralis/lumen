import { MaterialCommunityIcons } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Octicons from '@expo/vector-icons/Octicons';

import { IconPackType, ThemedIconComponentProps } from './ThemedIcon.type';

/**
 * https://icons.expo.fyi/Index
 */
export function ThemedIconComponent({
  icon,
  size,
  color,
  style,
}: ThemedIconComponentProps) {
  const { name, pack } = icon;

  switch (pack) {
    case IconPackType.MaterialCommunityIcons:
      return (
        <MaterialCommunityIcons
          style={ style }
          // @ts-ignore
          name={ name }
          size={ size }
          color={ color }
        />
      );
    case IconPackType.MaterialIcons:
      return (
        <MaterialIcons
          style={ style }
          // @ts-ignore
          name={ name }
          size={ size }
          color={ color }
        />
      );
    case IconPackType.Octicons:
      return (
        <Octicons
          style={ style }
          // @ts-ignore
          name={ name }
          size={ size }
          color={ color }
        />
      );
    case IconPackType.Ionicons:
      return (
        <Ionicons
          style={ style }
          // @ts-ignore
          name={ name }
          size={ size }
          color={ color }
        />
      );
    default:
      return null;
  }
}

export default ThemedIconComponent;
