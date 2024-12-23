import { Button } from 'react-native-paper';

import { ThemedButtonProps } from './ThemedButton.type';

export default function ThemedButton({ onPress, children, style }: ThemedButtonProps) {
  return (
    <Button
      // icon="camera"
      mode="contained"
      onPress={ onPress }
      style={ style }
    >
      { children }
    </Button>
  );
}
