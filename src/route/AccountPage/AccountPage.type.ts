import { ProfileInterface } from 'Type/Profile.interface';

export interface AccountPageComponentProps {
  isSignedIn: boolean;
  profile: ProfileInterface | null;
}
