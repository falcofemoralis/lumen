import { BadgeData } from 'Type/BadgeData.interface';
import { ProfileInterface } from 'Type/Profile.interface';

export interface AccountScreenComponentProps {
  isSignedIn: boolean;
  profile: ProfileInterface | null;
  badgeData: BadgeData;
  handleViewProfile: () => void;
  handleViewPayments: () => void;
  handleLogout: () => void;
  openSettings: () => void;
  openNotifications: () => void;
  openNotImplemented: () => void;
  openDownloads: () => void;
}
