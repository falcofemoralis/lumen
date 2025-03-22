import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';

import Dots from './Dots';
import Next from './Next';
import Previous from './Previous';
import { SliderContext } from './SliderProvider';

const styles = StyleSheet.create({
  flexDirectionColumn: {
    flexDirection: 'column',
  },
  flexDirectionRow: {
    flexDirection: 'row',
  },
  navigation: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
  },
  wrapper: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    maxWidth: '100%',
    position: 'absolute',
    width: '100%',
  },
});

const Navigation = () => {
  const { navigationBarBottom, navigationBarHeight, columnButtonStyle } = useContext(SliderContext);

  return (
    <View
      style={ [
        styles.wrapper,
        {
          bottom: navigationBarBottom,
          height: navigationBarHeight,
          maxHeight: navigationBarHeight,
        },
      ] }
    >
      <View
        style={ [
          styles.navigation,
          columnButtonStyle
            ? styles.flexDirectionColumn
            : styles.flexDirectionRow,
        ] }
      >
        { columnButtonStyle ? (
          <>
            <Dots />
            <Next />
            <Previous />
          </>
        ) : (
          <>
            { /* <Previous /> */ }
            <Dots />
            { /* <Next /> */ }
          </>
        ) }
      </View>
    </View>
  );
};

export default Navigation;
