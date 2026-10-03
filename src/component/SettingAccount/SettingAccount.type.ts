import { SettingCommonProps } from 'Component/SettingBase/SettingBase.type';

export type SettingAccountComponentProps = SettingCommonProps & {
  /** The login of the signed in account, null while there is none */
  account: string | null;
  /** Resolves to `false` when the credentials were refused, so the form stays open */
  onLogin: (name: string, password: string) => Promise<boolean>;
  onLogout: () => void;
};
