import { StyleProp, ViewStyle } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { scale } from 'Util/CreateStyles';

export const GRADIENT_SIZE_MOBILE = 300;
export const GRADIENT_SIZE_TV = 400;

export const PremiumGradient = ({ style, size: sz }: { style?: StyleProp<ViewStyle>, size: number }) => {
  const size = scale(sz);

  return (
    <Svg style={ style } height={ size } width={ size }>
      <Defs>
        <RadialGradient
          id="grad"
          cx={ size / 2 }
          cy={ size / 2 }
          r={ size / 2 }
          fx={ size / 2 }
          fy={ size / 2 }
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0.05" stopColor="#D819E0" stopOpacity="0.4" />
          <Stop offset="0.3" stopColor="#5B359A" stopOpacity="0.4" />
          <Stop offset="1" stopColor="#5B359A" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width={ size } height={ size } fill="url(#grad)" />
    </Svg>
  );
};
export const DefaultGradient = ({ style, size: sz }: { style?: StyleProp<ViewStyle>, size: number }) => {
  const size = scale(sz);

  return (
    <Svg style={ style } height={ size } width={ size }>
      <Defs>
        <RadialGradient
          id="grad"
          cx={ size / 2 }
          cy={ size / 2 }
          r={ size / 2 }
          fx={ size / 2 }
          fy={ size / 2 }
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0.05" stopColor="#EA1B45" stopOpacity="0.7" />
          <Stop offset="0.3" stopColor="#FC5909" stopOpacity="0.4" />
          <Stop offset="1" stopColor="#FC5909" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width={ size } height={ size } fill="url(#grad)" />
    </Svg>
  );
};