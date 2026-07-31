import { FilmPager } from 'Component/FilmPager';
import { Page } from 'Component/Page';

import { CategoryScreenComponentProps } from './CategoryScreen.type';

export function CategoryScreenComponent({
  pagerItems,
  ...pagerHandlers
}: CategoryScreenComponentProps) {
  return (
    <Page>
      <FilmPager
        pagerItems={ pagerItems }
        { ...pagerHandlers }
      />
    </Page>
  );
}

export default CategoryScreenComponent;
