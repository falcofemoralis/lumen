import { MaterialCommunityIcons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { IconComponentProps, IconPackType } from './Icon.type';

export function IconComponent(props: IconComponentProps) {
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
    default:
      return null;
  }
}

export default IconComponent;
