import { useIsTV } from 'Context/ConfigContext';

import ScrollToTopButtonComponent from './ScrollToTopButton.component';
import ScrollToTopButtonComponentTV from './ScrollToTopButton.component.atv';
import { ScrollToTopButtonComponentProps } from './ScrollToTopButton.type';

export function ScrollToTopButtonContainer(props: ScrollToTopButtonComponentProps) {
  const isTV = useIsTV();

  return isTV
    ? <ScrollToTopButtonComponentTV { ...props } />
    : <ScrollToTopButtonComponent { ...props } />;
}

export default ScrollToTopButtonContainer;