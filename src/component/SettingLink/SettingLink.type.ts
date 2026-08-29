import { SettingCommonProps } from 'Component/SettingBase/SettingBase.type';
import { ImageSourcePropType } from 'react-native';

export type SettingLinkComponentProps = SettingCommonProps & {
  /** Shown as a QR overlay on TV instead of opening the link. */
  imageLink?: ImageSourcePropType;
  onPress: () => Promise<void> | void;
};
