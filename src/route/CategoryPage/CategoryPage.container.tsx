import { FilmPagerInterface } from 'Component/FilmPager/FilmPager.type';
import { useServiceContext } from 'Context/ServiceContext';
import { withTV } from 'Hooks/withTV';
import { useState } from 'react';
import { FilmListInterface } from 'Type/FilmList.interface';
import { MenuItemInterface } from 'Type/MenuItem.interface';

import CategoryPageComponent from './CategoryPage.component';
import CategoryPageComponentTV from './CategoryPage.component.atv';
import { CategoryPageContainerProps } from './CategoryPage.type';

export function CategoryPageContainer({ link }: CategoryPageContainerProps) {
  const [filmPager, setFilmPager] = useState<FilmPagerInterface>({});
  const { getCurrentService } = useServiceContext();

  const onLoadFilms = async (
    _menuItem: MenuItemInterface,
    currentPage: number,
  ) => getCurrentService().getFilms(currentPage, link);

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

export default CategoryPageContainer;
