import { FilmPager } from 'Component/FilmPager';
import { Page } from 'Component/Page';

import { HomeScreenComponentProps } from './HomeScreen.type';

export function HomeScreenComponent({
  tabPosition,
  ...pagerHandlers
}: HomeScreenComponentProps) {
  return (
    <Page>
      <FilmPager
        key={ pagerHandlers.pagerItems.map((item) => item.menuItem.id).join('|') }
        { ...pagerHandlers }
        menuDefaultFocus
        tabPosition={ tabPosition }
        showScrollToTopButton
      />
    </Page>
  );
}

export default HomeScreenComponent;
