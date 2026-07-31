import { useIsTV } from 'Context/ConfigContext';

import ThemedScrollViewComponent from './ThemedScrollView.component';
import ThemedScrollViewComponentTV from './ThemedScrollView.component.atv';
import { ThemedScrollViewContainerProps } from './ThemedScrollView.type';

export function ThemedScrollViewContainer(props: ThemedScrollViewContainerProps) {
  const isTV = useIsTV();

  return isTV ? <ThemedScrollViewComponentTV { ...props } /> : <ThemedScrollViewComponent { ...props } />;

}

export default ThemedScrollViewContainer;
