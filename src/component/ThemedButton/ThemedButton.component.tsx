import { Button } from 'react-native-paper';

import { styles } from './ThemedButton.style';
import { ThemedButtonProps } from './ThemedButton.type';

export default function ThemedButton({ onPress, children, style }: ThemedButtonProps) {
  return (
    <Button
      mode="contained"
      onPress={ onPress }
      style={ [styles.container, style] }
      theme={ { roundness: 0 } }
    >
      { children }
    </Button>
  );
}
