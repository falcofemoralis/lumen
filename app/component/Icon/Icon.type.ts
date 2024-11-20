import { StyleProp, TextStyle } from 'react-native';

export interface Icon {
  name: string;
  pack: IconPackType;
}

export interface IconComponentProps {
  icon: Icon;
  size: number;
  color: string;
  style?: StyleProp<TextStyle> | undefined;
}

export enum IconPackType {
  MaterialCommunityIcons = 'MaterialCommunityIcons',
  MaterialIcons = 'MaterialIcons',
}
