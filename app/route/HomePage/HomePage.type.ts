import { PagerViewOnPageSelectedEvent } from 'react-native-pager-view';
import { PagerItemInterface } from 'Type/PagerItem.interface';
import { PaginationInterface } from 'Type/Pagination.interface';

export interface HomePageProps {
  pagerItems: PagerItemInterface[];
  selectedPagerItem: PagerItemInterface;
  isLoading: boolean;
  onNextLoad: (
    pagination: PaginationInterface,
    isRefresh?: boolean,
    isUpdate?: boolean
  ) => Promise<void>;
  handleMenuItemChange: (pagerItem: PagerItemInterface) => void;
  handlePagerScroll: (e: PagerViewOnPageSelectedEvent) => void;
}
