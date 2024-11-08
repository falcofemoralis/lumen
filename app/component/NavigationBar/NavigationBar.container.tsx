import { withTV } from 'Hooks/withTV';
import NavigationBarComponent from './NavigationBar.component';
import NavigationBarComponentTV from './NavigationBar.component.atv';

export function NavigationBarContainer() {
  return withTV(NavigationBarComponentTV, NavigationBarComponent);
}

export default NavigationBarContainer;
