import AppStore from 'Store/App.store';
import NavigationBarComponent from './NavigationBar.component';
import NavigationBarComponentTV from './NavigationBar.component.atv';

export function NavigationBarContainer() {
  return AppStore.isTV ? <NavigationBarComponentTV /> : <NavigationBarComponent />;
}

export default NavigationBarContainer;
