import React, { useContext } from 'react';
import {
  Animated, StyleSheet, TouchableOpacity, View,
} from 'react-native';

import { ButtonType } from '../types/Button.types';
import Button from './Button';
import { SliderContext } from './SliderProvider';

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});

const Next = () => {
  const {
    renderNextButton,
    renderDoneButton,
    buttonsMaxSize,
    nextLabel,
    doneLabel,
    slide,
    goToNewSlide,
    isLastSlide,
    animations,
  } = useContext(SliderContext);
  const { _opacityOfNextButton, _opacityOfDoneButton } = animations;

  const renderDefaultNextButton = (label: string) => (
    <Button
      label={ label }
      type={ ButtonType.Next }
    />
  );
  const renderDefaultDoneButton = (label: string) => (
    <Button
      label={ label }
      type={ ButtonType.Done }
    />
  );

  return (
    <View style={ [styles.wrapper, { maxWidth: buttonsMaxSize }] }>
      <TouchableOpacity onPress={ () => goToNewSlide(slide.active + 1) }>
        { !isLastSlide ? (
          <Animated.View style={ { opacity: _opacityOfNextButton } }>
            { renderNextButton
              ? renderNextButton(nextLabel)
              : renderDefaultNextButton(nextLabel) }
          </Animated.View>
        ) : (
          <Animated.View style={ { opacity: _opacityOfDoneButton } }>
            { renderDoneButton
              ? renderDoneButton(doneLabel)
              : renderDefaultDoneButton(doneLabel) }
          </Animated.View>
        ) }
      </TouchableOpacity>
    </View>
  );
};

export default Next;
