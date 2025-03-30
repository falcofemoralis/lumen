import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { type ButtonProps, ButtonType } from '../types/Button.types';

const styles = StyleSheet.create({
  label: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  skipButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const Button = ({ label, type }: ButtonProps) => {
  if (type === ButtonType.Skip) {
    return (
      <View style={ styles.skipButton }>
        <Text style={ styles.label }>{ label }</Text>
      </View>
    );
  }

  return <Text style={ styles.label }>{ label }</Text>;
};

export default Button;
