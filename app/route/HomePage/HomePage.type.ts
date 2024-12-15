import PagerView from 'react-native-pager-view';
import { PagerItemInterface } from 'Type/PagerItem.interface';
import { PaginationInterface } from 'Type/Pagination.interface';

export interface HomePageProps {
  pagerItems: PagerItemInterface[];
  selectedPagerItem: PagerItemInterface;
  pagerViewRef: React.RefObject<PagerView>;
  isLoading: boolean;
  onNextLoad: (
    pagination: PaginationInterface,
    isRefresh?: boolean,
    isUpdate?: boolean
  ) => Promise<void>;
  handleMenuItemChange: (pagerItem: PagerItemInterface) => void;
}
