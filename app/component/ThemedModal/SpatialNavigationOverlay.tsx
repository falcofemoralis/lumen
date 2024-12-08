import { SpatialNavigationRoot } from 'react-tv-space-navigation';
import { useLockOverlay } from './useLockOverlay';

type SpatialNavigationOverlayProps = {
  isModalVisible: boolean;
  hideModal: () => void;
  children: React.ReactNode;
};

export const SpatialNavigationOverlay = ({
  isModalVisible,
  hideModal,
  children,
}: SpatialNavigationOverlayProps) => {
  useLockOverlay({ isModalVisible, hideModal });

  return <SpatialNavigationRoot>{children}</SpatialNavigationRoot>;
};
