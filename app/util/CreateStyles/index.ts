import { Dimensions, StyleSheet } from 'react-native';
import AppStore from 'Store/App.store';

const { width: W } = Dimensions.get('screen');

const objectMap = (object: any, mapFn: any) => {
  return Object.keys(object).reduce((result: { [key: string]: any }, key) => {
    result[key] = mapFn(object[key]);
    return result;
  }, {});
};

const objectMap2 = (object: any, overload: any) => {
  return Object.keys(object).reduce((result: { [key: string]: any }, key) => {
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
};

/**
 * ATV always has size 960, so need to convert TVbox to 960
 */
export const ratio = () => {
  return AppStore.isTV ? W / 960 : 1;
};

export const scale = (number: any) => {
  const value = number * Number(ratio().toFixed(1));
  return Number(value.toFixed(1));
};

export default function CreateStyles<
  T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>,
>(styleSheet: T & StyleSheet.NamedStyles<any>, overload = {}): T {
  return StyleSheet.create(
    objectMap(styleSheet, (value: any) => {
      return objectMap2(value, overload) as T;
    })
  ) as T;
}
