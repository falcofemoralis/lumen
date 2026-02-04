import 'moment/locale/ru';

import { ThemedText } from 'Component/ThemedText';
import moment from 'moment';
import { useEffect, useState } from 'react';
import Moment from 'react-moment';

const ReactLiveClock = ({ style }: { style?: React.CSSProperties }) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    moment.locale('ru');
  }, []);

  useEffect(() => {
    const tick = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);

    return () => clearInterval(tick);
  }, []);

  return (
    <Moment
      element={ ThemedText }
      format="ddd DD MMM HH:mm"
      locale="ru"
      style={ style }
    >
      { currentTime }
    </Moment>
  );
};

export default ReactLiveClock;