import AppStore from 'Store/App.store';
import NavigationBarComponent from './NavigationBar.component';
import NavigationBarComponentTV from './NavigationBar.component.atv';
import { observer } from 'mobx-react-lite';

export function NavigationBarContainer() {
  console.log('render NavigationBarContainer');

  return AppStore.isTV ? <NavigationBarComponentTV /> : <NavigationBarComponent />;
}

export default observer(NavigationBarContainer);
