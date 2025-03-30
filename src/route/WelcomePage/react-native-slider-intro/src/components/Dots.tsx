import React, { useContext } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { SliderContext } from './SliderProvider';

const styles = StyleSheet.create({
  animatedDot: {
    borderRadius: 10,
    flex: 1,
    maxWidth: 2,
  },
  animatedDotInnerWrapper: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  animatedDotWrapper: {
    flex: 1,
    flexDirection: 'row',
    position: 'absolute',
  },
  dotList: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dotWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  fixDot: {
    borderRadius: 10,
    flex: 1,
  },
  wrapper: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});

const Dots = () => {
  const {
    navContainerMaxSize,
    numberOfSlides,
    fixDotBackgroundColor,
    fixDotOpacity,
    dotWidth,
    animations,
    animatedDotBackgroundColor,
  } = useContext(SliderContext);
  const arrayOfSlideIndex = [...Array(numberOfSlides).keys()];

  const { _slideDotScaleX, _slideDotTranslateX } = animations;

  return (
    <View style={ [styles.wrapper, { maxWidth: navContainerMaxSize }] }>
      <View style={ [styles.dotWrapper, { maxWidth: navContainerMaxSize }] }>
        <View style={ styles.dotList }>
          { arrayOfSlideIndex.map((_, index) => (
            <View
              key={ index }
              style={ [
                styles.fixDot,
                {
                  backgroundColor: fixDotBackgroundColor,
                  opacity: fixDotOpacity,
                  width: dotWidth,
                  maxWidth: dotWidth,
                  height: dotWidth,
                  maxHeight: dotWidth,
                },
              ] }
            />
          )) }
        </View>
      </View>
      <View style={ styles.animatedDotWrapper }>
        <View style={ styles.animatedDotInnerWrapper }>
          <Animated.View
            style={ [
              styles.animatedDot,
              {
                transform: [
                  { translateX: _slideDotTranslateX },
                  {
                    scaleX: _slideDotScaleX,
                  },
                ],
                borderRadius: Animated.divide(dotWidth, _slideDotScaleX),
                width: dotWidth,
                minWidth: dotWidth,
                height: dotWidth,
                minHeight: dotWidth,
                maxHeight: dotWidth,
                backgroundColor: animatedDotBackgroundColor,
              },
            ] }
          />
        </View>
      </View>
    </View>
  );
};

export default Dots;
