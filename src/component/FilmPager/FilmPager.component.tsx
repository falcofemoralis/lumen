import FilmGrid from 'Component/FilmGrid';
import ThemedView from 'Component/ThemedView';
import { Dimensions } from 'react-native';
import { TabBar, TabView } from 'react-native-tab-view';

import { styles } from './FilmPager.style';
import { FilmPagerComponentProps, PagerItemInterface } from './FilmPager.type';

const LazyPlaceholder = ({ route }: any) => <ThemedView style={ styles.lazyContainer } />;

export function FilmPagerComponent({
  pagerItems,
  selectedPagerItem,
  onNextLoad,
  handleMenuItemChange,
}: FilmPagerComponentProps) {
  const handleIndexChange = (index: number) => {
    handleMenuItemChange(pagerItems[index]);
  };

  const renderPage = ({ route }: { route: PagerItemInterface }) => {
    const { films, pagination } = route;

    return (
      <FilmGrid
        films={ films ?? [] }
        onNextLoad={ onNextLoad }
      />
    );
  };

  const renderLazyPlaceholder = ({ route }: any) => <LazyPlaceholder route={ route } />;

  const renderTabBar = (props: any) => (
    <TabBar
      { ...props }
      indicatorStyle={ styles.tabBarIndicator }
      style={ styles.tabBar }
      tabStyle={ styles.tabStyle }
      scrollEnabled
    />
  );

  return (
    <TabView
      lazy
      renderLazyPlaceholder={ renderLazyPlaceholder }
      navigationState={ {
        index: pagerItems.findIndex(({ key }) => key === selectedPagerItem.key),
        routes: pagerItems,
      } }
      renderScene={ renderPage }
      onIndexChange={ handleIndexChange }
      initialLayout={ { width: Dimensions.get('window').width } }
      style={ styles.container }
      renderTabBar={ renderTabBar }
    />
  );
}

export default FilmPagerComponent;
