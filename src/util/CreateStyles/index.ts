import { Dimensions, StyleSheet } from 'react-native';
import { scale as mobileScale } from 'react-native-size-matters';
import ConfigStore from 'Store/Config.store';

const { width: W } = Dimensions.get('screen');

const objectMap = (object: any, mapFn: any) => Object.keys(object)
  .reduce((result: { [key: string]: any }, key) => {
    result[key] = mapFn(object[key]);

    return result;
  }, {});

const objectMap2 = (object: any, overload: any) => Object.keys(object)
  .reduce((result: { [key: string]: any }, key) => {
    if (typeof object[key] === 'number') {
      if (key.includes('flex') || key.includes('opacity') || key.includes('elevation')) {
        result[key] = object[key];
      } else {
        result[key] = scale(object[key]);
      }
    } else {
      result[key] = object[key];
    }

    return { ...overload, ...result };
  }, {});

/**
 * TV always has size 960, so need to convert TVbox to 960
 */
export const tvScale = () => (W / 960);

export const scale = (number: any) => {
  const value = ConfigStore.isTV() ? number * Number(tvScale().toFixed(1)) : mobileScale(number);

  return Number(value.toFixed(0));
};

export default function CreateStyles<
  T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>,
>(styleSheet: T & StyleSheet.NamedStyles<any>, overload = {}): T {
  return StyleSheet.create(
    objectMap(styleSheet, (value: any) => objectMap2(value, overload) as T),
  ) as T;
}
