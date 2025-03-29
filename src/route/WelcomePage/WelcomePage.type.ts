import { IconInterface } from 'Component/ThemedIcon/ThemedIcon.type';
import { ProfileInterface } from 'Type/Profile.interface';

export interface WelcomePageComponentProps {
  slides: SlideInterface[];
  selectedDeviceType: DeviceType | null;
  isLoading: boolean;
  isProviderValid: boolean | null;
  isCDNValid: boolean | null;
  selectedProvider: string | null;
  selectedCDN: string | null;
  profile: ProfileInterface | null;
  handleSelectTV: () => void;
  handleSelectMobile: () => void;
  validateProvider: () => void;
  updateProvider: (value: string) => void;
  validateCDN: () => void;
  updateCDN: (value: string) => void;
  complete: () => void;
  setSelectedProvider: (value: string) => void;
  setSelectedCDN: (value: string) => void;
  login: (username: string, password: string) => void;
}

export enum SLIDE_TYPE {
  WELCOME = 'WELCOME',
  CONFIGURE = 'CONFIGURE',
  PROVIDER = 'PROVIDER',
  CDN = 'CDN',
  LOGIN = 'LOGIN',
  COMPLETE = 'COMPLETE',
}

export type SlideType = keyof typeof SLIDE_TYPE;

export interface SlideInterface {
  id: SLIDE_TYPE;
  title: string;
  subtitle: string;
  icon: IconInterface
}

export type DeviceType = 'TV' | 'MOBILE';
