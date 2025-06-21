import { withTV } from 'Hooks/withTV';

import InfoBlockComponent from './InfoBlock.component';
import InfoBlockComponentTV from './InfoBlock.component.atv';
import { InfoBlockContainerProps } from './InfoBlock.type';

export function InfoBlockContainer({
  title,
  subtitle,
}: InfoBlockContainerProps) {
  const containerFunctions = {
  };

  const containerProps = () => ({
    title,
    subtitle,
  });

  return withTV(InfoBlockComponentTV, InfoBlockComponent, {
    ...containerFunctions,
    ...containerProps(),
  });
}

export default InfoBlockContainer;
