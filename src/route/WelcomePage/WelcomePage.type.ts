export interface WelcomePageComponentProps {
  slides: SlideInterface[];
  selectedDeviceType: DeviceType | null;
  configureDeviceType: (type: DeviceType) => void;
  complete: () => void;
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
  IconComponent: React.ComponentType<any>,
}

export enum DeviceType {
  TV = 'TV',
  MOBILE = 'MOBILE',
}
