import { useQuery } from '@tanstack/react-query';
import { FilmPager } from 'Component/FilmPager';
import { PagerItemInterface } from 'Component/FilmPager/FilmPager.type';
import { useConfigContext } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import { ACCOUNT_TAB } from 'Navigation/navigationRoutes';
import { ReactNode } from 'react';



import { queryKeys } from 'Util/Query';
import NotificationsScreen from '../NotificationsScreen/NotificationsScreen.container';
import DownloadsScreen from '../DownloadsScreen/DownloadsScreen.container';

export const RecentHub = ({ children }: { children: ReactNode }) => {

  const { showEpisodeUpdateCount, tabPosition } = useConfigContext();
  const { badgeData } = useServiceContext();
  const { data } = useQuery<{ items: unknown[] }[]>({ queryKey: queryKeys.notifications(), enabled: false });
  const count = data?.reduce((sum, group) => sum + group.items.length, 0) ?? badgeData[ACCOUNT_TAB] ?? 0;


  const titles = ['Досмотреть', 'Обновление серий' + (showEpisodeUpdateCount ? ' (' + count + ')' : ''), 'Загрузки'];
  const pagerItems: PagerItemInterface[] = titles.map((title, index) => ({
    menuItem: { id: ['recent', 'updates', 'downloads'][index], title, path: '' },
    films: [],
    pagination: { currentPage: 1, totalPages: 1 },
  }));
  return (
    <FilmPager
      pagerItems={ pagerItems }
      tabPosition={ tabPosition }
      onPreLoad={ () => {} }
      onNextLoad={ async () => {} }
      renderPageContent={ (_item, index) => (
        index === 0 ? children : index === 1 ? <NotificationsScreen /> : <DownloadsScreen />
      ) }
    />
  );
};