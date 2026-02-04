import { useConfigContext } from 'Context/ConfigContext';

import InfoBlockComponent from './InfoBlock.component';
import InfoBlockComponentTV from './InfoBlock.component.atv';
import { InfoBlockContainerProps } from './InfoBlock.type';

export function InfoBlockContainer({
  title,
  subtitle,
  hideIcon,
  style,
}: InfoBlockContainerProps) {
  const { isTV } = useConfigContext();

  const containerProps = {
    title,
    subtitle,
    hideIcon,
    style,
  };

  return isTV ? <InfoBlockComponentTV { ...containerProps } /> : <InfoBlockComponent { ...containerProps } />;

}

export default InfoBlockContainer;
