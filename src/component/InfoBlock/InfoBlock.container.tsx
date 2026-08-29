import { useIsTV } from 'Context/ConfigContext';

import InfoBlockComponent from './InfoBlock.component';
import InfoBlockComponentTV from './InfoBlock.component.atv';
import { InfoBlockContainerProps } from './InfoBlock.type';

export function InfoBlockContainer({
  title,
  subtitle,
  hideIcon,
  style,
  Icon,
}: InfoBlockContainerProps) {
  const isTV = useIsTV();

  const containerProps = {
    title,
    subtitle,
    hideIcon,
    style,
    Icon,
  };

  return isTV ? <InfoBlockComponentTV { ...containerProps } /> : <InfoBlockComponent { ...containerProps } />;

}

export default InfoBlockContainer;
