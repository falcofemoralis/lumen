import { ThemedText } from 'Component/ThemedText';
import { getCurrentLanguage } from 'i18n/index';
import { useEffect, useState } from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { formatClockDateTime } from 'Util/Date';

const CLOCK_TICK_MS = 60000;

const ReactLiveClock = ({ style }: { style?: StyleProp<TextStyle> }) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const tick = setInterval(() => {
      setCurrentTime(Date.now());
    }, CLOCK_TICK_MS);

    return () => clearInterval(tick);
  }, []);

  return (
    <ThemedText style={ style }>
      { formatClockDateTime(currentTime, getCurrentLanguage()) }
    </ThemedText>
  );
};

export default ReactLiveClock;
