import { FilmPagerInterface } from 'Component/FilmPager/FilmPager.type';
import { withTV } from 'Hooks/withTV';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import ServiceStore from 'Store/Service.store';
import { FilmListInterface } from 'Type/FilmList.interface';
import { MenuItemInterface } from 'Type/MenuItem.interface';

import CategoryPageComponent from './CategoryPage.component';
import CategoryPageComponentTV from './CategoryPage.component.atv';
import { CategoryPageContainerProps } from './CategoryPage.type';

export function CategoryPageContainer({ link }: CategoryPageContainerProps) {
  const [filmPager, setFilmPager] = useState<FilmPagerInterface>({});

  const onLoadFilms = async (
    _menuItem: MenuItemInterface,
    currentPage: number,
  ) => ServiceStore.getCurrentService().getFilms(currentPage, link);

  const onUpdateFilms = async (key: string, filmList: FilmListInterface) => {
    setFilmPager((prevFilmPager) => ({
      ...prevFilmPager,
      [key]: {
        filmList,
      },
    }));
  };

  const containerFunctions = {
    onLoadFilms,
    onUpdateFilms,
  };

  const containerProps = () => ({
    filmPager,
  });

  return withTV(CategoryPageComponentTV, CategoryPageComponent, {
    ...containerFunctions,
    ...containerProps(),
  });
}

export default observer(CategoryPageContainer);
