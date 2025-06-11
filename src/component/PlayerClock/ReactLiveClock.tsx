import ThemedText from 'Component/ThemedText';
import React, { useEffect, useState } from 'react';
import Moment from 'react-moment';

const ReactLiveClock = ({ style }: { style?: React.CSSProperties }) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const tick = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(tick);
  }, []);

  return (
    <Moment
      element={ ThemedText }
      format="HH:mm"
      style={ style }
    >
      { currentTime }
    </Moment>
  );
};

export default ReactLiveClock;