import { StyleProp, TextStyle } from 'react-native';

export interface IconInterface {
  name: string;
  pack: IconPackType;
}

export interface ThemedIconComponentProps {
  icon: IconInterface;
  size: number;
  color: string;
  style?: StyleProp<TextStyle> | undefined;
}

export enum IconPackType {
  MaterialCommunityIcons = 'MaterialCommunityIcons',
  MaterialIcons = 'MaterialIcons',
  Octicons = 'Octicons',
  Ionicons = 'Ionicons',
}
