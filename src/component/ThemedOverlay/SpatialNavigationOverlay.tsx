import { SpatialNavigationRoot } from 'react-tv-space-navigation';

import { useLockOverlay } from './useLockOverlay';

type SpatialNavigationOverlayProps = {
  isModalOpened: boolean;
  isModalVisible: boolean;
  hideModal: () => void;
  children: React.ReactNode;
};

export const SpatialNavigationOverlay = ({
  isModalOpened,
  isModalVisible,
  hideModal,
  children,
}: SpatialNavigationOverlayProps) => {
  useLockOverlay({ isModalOpened, isModalVisible, hideModal });

  return <SpatialNavigationRoot isActive={ isModalOpened }>{ children }</SpatialNavigationRoot>;
};
