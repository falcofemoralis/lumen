import FilmGrid from 'Component/FilmGrid';
import { useCallback } from 'react';
import { View } from 'react-native';
import { TabBar, TabView } from 'react-native-tab-view';

import { styles } from './FilmPager.style';
import { FilmPagerComponentProps, PagerItemInterface } from './FilmPager.type';

const LazyPlaceholder = ({ route }: any) => <View style={ styles.lazyContainer } />;

export function FilmPagerComponent({
  pagerItems,
  selectedPagerItem,
  onNextLoad,
  handleMenuItemChange,
}: FilmPagerComponentProps) {
  const handleIndexChange = useCallback((index: number) => {
    handleMenuItemChange(pagerItems[index]);
  }, [pagerItems]);

  const renderPage = useCallback(({ route }: { route: PagerItemInterface }) => {
    const { films } = route;

    return (
      <FilmGrid
        films={ films ?? [] }
        onNextLoad={ onNextLoad }
      />
    );
  }, [onNextLoad]);

  const renderLazyPlaceholder = useCallback(
    ({ route }: any) => <LazyPlaceholder route={ route } />,
    [],
  );

  const renderTabBar = useCallback((props: any) => (
    <TabBar
      { ...props }
      indicatorStyle={ styles.tabBarIndicator }
      style={ styles.tabBar }
      tabStyle={ styles.tabStyle }
      scrollEnabled
    />
  ), []);

  if (!pagerItems.length) {
    return renderPage({ route: selectedPagerItem });
  }

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
      style={ styles.container }
      renderTabBar={ renderTabBar }
      tabBarPosition='bottom'
    />
  );
}

export default FilmPagerComponent;
