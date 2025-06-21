import { SpatialNavigationRoot } from 'react-tv-space-navigation';

import { useLockOverlay } from './useLockOverlay';

type SpatialNavigationOverlayProps = {
  isModalOpened: boolean;
  isModalVisible: boolean;
  hideModal: () => void;
  children: React.ReactNode;
  id: string;
};

export const SpatialNavigationOverlay = ({
  isModalOpened,
  isModalVisible,
  hideModal,
  children,
  id,
}: SpatialNavigationOverlayProps) => {
  useLockOverlay({ isModalOpened, isModalVisible, hideModal, id });

  return <SpatialNavigationRoot>{ children }</SpatialNavigationRoot>;
};
