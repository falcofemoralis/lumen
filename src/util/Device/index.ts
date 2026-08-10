import { NavigationBar } from 'expo-navigation-bar';
import { StatusBar, StatusBarAnimation } from 'expo-status-bar';
import RNRestart from 'react-native-restart';

export const restartApp = () => {
  RNRestart.restart();
};

export const hideSystemBars = (animation: StatusBarAnimation = 'none') => {
  // NavigationBar.setHidden skips calls that match the last requested state, so the
  // bar has to be toggled to force a re-hide once android brings it back on resume
  NavigationBar.setHidden(false);
  NavigationBar.setHidden(true);
  StatusBar.setHidden(true, animation);
};

export const showSystemBars = (animation: StatusBarAnimation = 'none') => {
  NavigationBar.setHidden(false);
  StatusBar.setHidden(false, animation);
};
