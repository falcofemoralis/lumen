import { MaterialCommunityIcons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Octicons from '@expo/vector-icons/Octicons';
import { IconPackType, ThemedIconComponentProps } from './ThemedIcon.type';

export function ThemedIconComponent(props: ThemedIconComponentProps) {
  const { icon, size, color, style } = props;
  const { name, pack } = icon;

  switch (pack) {
    case IconPackType.MaterialCommunityIcons:
      return (
        <MaterialCommunityIcons
          style={style}
          // @ts-ignore
          name={name}
          size={size}
          color={color}
        />
      );
    case IconPackType.MaterialIcons:
      return (
        <MaterialIcons
          style={style}
          // @ts-ignore
          name={name}
          size={size}
          color={color}
        />
      );
    case IconPackType.Octicons:
      return (
        <Octicons
          style={style}
          // @ts-ignore
          name={name}
          size={size}
          color={color}
        />
      );
    default:
      return null;
  }
}

export default ThemedIconComponent;
