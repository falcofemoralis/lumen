import { Animated, StyleProp, ViewStyle } from 'react-native';

export interface ThemedModalProps {
  visible: boolean;
  onHide: () => void;
  contentContainerStyle?: Animated.WithAnimatedValue<StyleProp<ViewStyle>>;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}
