import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { Wrapper } from 'Component/Wrapper';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { ArrowLeft } from 'lucide-react-native';
import { AppStackParamList } from 'Navigation/navigationTypes';
import { View } from 'react-native';
import { useAppTheme } from 'Theme/context';

import { componentStyles } from './Header.style';
import { HeaderComponentProps } from './Header.type';

export const HeaderComponent = ({
  title,
  style,
  additionalAction,
  AdditionalActionIcon,
  isDeepLink = false,
}: HeaderComponentProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { scale, theme } = useAppTheme();
  const styles = useThemedStyles(componentStyles);

  return (
    <Wrapper>
      <View style={ [styles.topActions, style] }>
        <View style={ styles.leftActions }>
          <ThemedPressable
            style={ styles.topActionsButton }
            contentStyle={ styles.topActionsButtonContent }
            onPress={ () => {
              if (isDeepLink) {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Tabs', params: { screen: 'Home-tab' } }],
                });
              } else {
                navigation.goBack();
              }
            } }
          >
            <ArrowLeft
              size={ scale(24) }
              color={ theme.colors.icon }
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
              color={ theme.colors.icon }
            />
          </ThemedPressable>
        ) }
      </View>
    </Wrapper>
  );
};

export default HeaderComponent;