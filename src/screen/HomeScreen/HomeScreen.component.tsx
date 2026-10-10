import { FilmPager } from 'Component/FilmPager';
import { ThemedButton } from 'Component/ThemedButton';
import { Page } from 'Component/Page';
import { useConfigContext } from 'Context/ConfigContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import Settings from 'lucide-react-native/icons/settings';
import { SETTINGS_SCREEN } from 'Navigation/navigationRoutes';
import { AppStackParamList } from 'Navigation/navigationTypes';
import { useAppTheme } from 'Theme/context';

import { HomeScreenComponentProps } from './HomeScreen.type';

export function HomeScreenComponent({
  tabPosition,
  ...pagerHandlers
}: HomeScreenComponentProps) {
  const { scale, theme } = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { newHomeInterface } = useConfigContext();

  return (
    <Page>
      <FilmPager
        key={ pagerHandlers.pagerItems.map((item) => item.menuItem.id).join('|') }
        { ...pagerHandlers }
        tabPosition={ tabPosition }
        tabBarRightPadding={ newHomeInterface ? 9 : undefined }
        TabBarActionComponent={ newHomeInterface && (
          <ThemedButton
            style={ {
              width: scale(44),
              backgroundColor: 'transparent',
            } }
            contentStyle={ {
              width: '100%',
              padding: 0,
              backgroundColor: 'transparent',
            } }
            IconComponent={ Settings }
            iconProps={ {
              size: scale(20),
              color: theme.colors.text,
            } }
            onPress={ () => navigation.navigate(SETTINGS_SCREEN) }
          />
        ) }
        showScrollToTopButton
      />
    </Page>
  );
}

export default HomeScreenComponent;

