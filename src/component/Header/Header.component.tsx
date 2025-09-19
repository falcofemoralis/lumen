import { useNavigation } from '@react-navigation/native';
import ThemedPressable from 'Component/ThemedPressable';
import ThemedText from 'Component/ThemedText';
import Wrapper from 'Component/Wrapper';
import { ArrowLeft } from 'lucide-react-native';
import { View } from 'react-native';
import { Colors } from 'Style/Colors';
import { scale } from 'Util/CreateStyles';

import { styles } from './Header.style';
import { HeaderComponentProps } from './Header.type';

export const HeaderComponent = ({
  title,
  style,
  additionalAction,
  AdditionalActionIcon,
}: HeaderComponentProps) => {
  const navigation = useNavigation();

  return (
    <Wrapper>
      <View style={ [styles.topActions, style] }>
        <View style={ styles.leftActions }>
          <ThemedPressable
            style={ styles.topActionsButton }
            contentStyle={ styles.topActionsButtonContent }
            onPress={ () => navigation.goBack() }
          >
            <ArrowLeft
              size={ scale(24) }
              color={ Colors.white }
            />
          </ThemedPressable>
          { title && (
            <ThemedText style={ styles.title }>
              { title }
            </ThemedText>
          ) }
        </View>
        { AdditionalActionIcon && (
          <ThemedPressable
            style={ styles.topActionsButton }
            contentStyle={ styles.topActionsButtonContent }
            onPress={ additionalAction }
          >
            <AdditionalActionIcon
              size={ scale(24) }
              color={ Colors.white }
            />
          </ThemedPressable>
        ) }
      </View>
    </Wrapper>
  );
};

export default HeaderComponent;