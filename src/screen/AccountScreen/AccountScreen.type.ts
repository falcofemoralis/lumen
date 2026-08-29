import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { RefObject } from 'react';
import { BadgeData } from 'Type/BadgeData.interface';
import { ProfileInterface } from 'Type/Profile.interface';

export interface AccountScreenComponentProps {
  isSignedIn: boolean;
  isLocalLibrary: boolean;
  profile: ProfileInterface | null;
  badgeData: BadgeData;
  handleViewProfile: () => void;
  handleViewPayments: () => void;
  handleLogout: () => void;
  confirmLogout: () => void;
  logoutConfirmOverlayRef: RefObject<ThemedOverlayRef | null>;
  openSettings: () => void;
  openNotifications: () => void;
  openMyComments: () => void;
  openDownloads: () => void;
}
