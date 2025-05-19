import { type ViewProps } from 'react-native';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

// TODO rework when reanimated types are fixed
export type AnimatedThemedViewProps = {
  style?: {
    width: number;
    marginRight: number;
    left: number;
    marginLeft: number;
    transitionProperty?: string | string[];
    transitionDuration: number;
  }
  children?: React.ReactNode;
};
