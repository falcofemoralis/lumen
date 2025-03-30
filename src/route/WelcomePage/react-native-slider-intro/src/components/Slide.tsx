import React from 'react';
import {
  Dimensions,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import type { SliderIntroItemProps } from '../types/SliderIntroItem.types';

const styles = StyleSheet.create({
  image: {
    maxHeight: Dimensions.get('window').width,
    maxWidth: Dimensions.get('window').width,
  },
  link: {
    color: '#2f39ff',
    fontSize: 15,
    marginLeft: 20,
    marginRight: 20,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  slide: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-start',
  },
  text: {
    color: 'white',
    fontSize: 15,
    lineHeight: 24,
    marginLeft: 20,
    marginRight: 20,
    textAlign: 'center',
  },
  title: {
    color: 'white',
    fontSize: 24,
    textAlign: 'center',
  },
  wrapper: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
    marginTop: 10,
    maxHeight: Dimensions.get('window').height * 0.85,
  },
});

const deviceMaxHeight = Dimensions.get('screen').height;

const Slide = ({ item }: { item: SliderIntroItemProps }) => {
  const {
    activeLanguage,
    slideMaxHeightPercent,
    index,
    backgroundColor,
    title,
    image,
    text,
    link,
  } = item;
  const language = activeLanguage || 'en';
  const slideHeight = deviceMaxHeight * (slideMaxHeightPercent || 0.78);

  return (
    <View
      key={ index }
      style={ [styles.slide, { backgroundColor }] }
    >
      <View
        style={ [
          styles.wrapper,
          {
            height: slideHeight,
            maxHeight: slideHeight,
          },
        ] }
      >
        <Text style={ styles.title }>
          { Array.isArray(title) ? title[language as unknown as number] : title }
        </Text>
        { image && (
          <Image
            style={ styles.image }
            source={ image }
          />
        ) }
        <View>
          <Text style={ styles.text }>
            { Array.isArray(text) ? text[language as unknown as number] : text }
          </Text>
          { link && (
            <TouchableOpacity onPress={ () => Linking.openURL(link) }>
              <Text style={ styles.link }>{ link }</Text>
            </TouchableOpacity>
          ) }
        </View>
      </View>
    </View>
  );
};

export default Slide;
