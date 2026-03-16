import { useState } from 'react';
import {
  Animated,
  type ImageStyle,
  StyleSheet,
} from 'react-native';

const STAR_IMAGE = require('../../../assets/images/star.png');
const STAR_SELECTED_IMAGE = require('../../../assets/images/star-selected.png');
const STAR_SIZE = 40;

export type StarProps = {
  starImage?: string;
  fill?: boolean;
  size?: number;
  selectedColor?: string;
  unSelectedColor?: string;
  isDisabled?: boolean;
  starStyle?: ImageStyle;
  position?: number;
  starSelectedInPosition?: (value: number) => void;
};

const Star: React.FunctionComponent<StarProps> = ({
  starImage = STAR_IMAGE,
  fill,
  size,
  selectedColor = '#f1c40f',
  unSelectedColor = '#BDC3C7',
  isDisabled,
  starStyle,
  position = 1,
  starSelectedInPosition = () => {},
}) => {
  const [selected, setSelected] = useState<boolean>(false);
  const springValue = new Animated.Value(1);

  const spring = () => {
    springValue.setValue(1.2);

    Animated.spring(springValue, {
      toValue: 1,
      friction: 2,
      tension: 1,
      useNativeDriver: true,
    }).start();

    setSelected(!selected);

    starSelectedInPosition(position);
  };

  const starSource =
    fill && selectedColor === null ? STAR_SELECTED_IMAGE : starImage;

  return (
    <Animated.Image
      source={ starSource }
      style={ StyleSheet.flatten([
        styles.starStyle,
        {
          tintColor: fill && selectedColor ? selectedColor : unSelectedColor,
          width: size || STAR_SIZE,
          height: size || STAR_SIZE,
          transform: [{ scale: springValue }],
        },
        starStyle && starStyle,
      ]) }
    />
  );
};

export default Star;

const styles = StyleSheet.create({
  starStyle: {
    margin: 3,
  },
});
