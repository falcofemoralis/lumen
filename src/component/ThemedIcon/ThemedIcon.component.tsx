import { ThemedIconComponentProps } from './ThemedIcon.type';

/**
 * https://icons.expo.fyi/Index
 * https://lucide.dev/guide/packages/lucide-react-native
 * https://lucide.dev/icons/
 */
export function ThemedIconComponent({
  icon,
  size,
  color,
  style,
}: ThemedIconComponentProps) {
  const { name, pack } = icon;

  return null;
  // switch (pack) {
  //   case IconPackType.MaterialCommunityIcons:
  //     return (
  //       <MaterialCommunityIcons
  //         style={ style }
  //         // @ts-ignore
  //         name={ name }
  //         size={ size }
  //         color={ color }
  //       />
  //     );
  //   case IconPackType.MaterialIcons:
  //     return (
  //       <MaterialIcons
  //         style={ style }
  //         // @ts-ignore
  //         name={ name }
  //         size={ size }
  //         color={ color }
  //       />
  //     );
  //   case IconPackType.Octicons:
  //     return (
  //       <Octicons
  //         style={ style }
  //         // @ts-ignore
  //         name={ name }
  //         size={ size }
  //         color={ color }
  //       />
  //     );
  //   case IconPackType.Ionicons:
  //     return (
  //       <Ionicons
  //         style={ style }
  //         // @ts-ignore
  //         name={ name }
  //         size={ size }
  //         color={ color }
  //       />
  //     );
  //   default:
  //     return null;
  // }

}

export default ThemedIconComponent;
