import { Card } from 'react-native-paper';

import { ThemedCardComponentProps } from './ThemedCard.type';

export const ThemedCardComponent = ({
  style,
  children,
}: ThemedCardComponentProps) => (
  <Card style={ style }>
    <Card.Content>
      { children }
    </Card.Content>
  </Card>
);

export default ThemedCardComponent;
