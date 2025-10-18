import { NavigationRoute, ParamListBase } from '@react-navigation/native';

export type BadgeData = {
  [key in NavigationRoute<ParamListBase, string>['name']]?: number;
}
