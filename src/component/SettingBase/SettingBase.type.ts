import { ComponentType, ReactNode } from 'react';

export type SettingBaseConfirmation = {
  title: string;
  message?: string;
}

/**
 * Presentational props shared by every concrete setting component.
 */
export type SettingCommonProps = {
  title: string;
  subtitle?: string | null;
  isHidden?: boolean;
  isEnabled?: boolean;
  isLoading?: boolean;
  IconComponent?: ComponentType<any>;
  iconProps?: Record<string, any>;
  iconPropsFocused?: Record<string, any>;
  confirmation?: SettingBaseConfirmation;
  withLoader?: boolean;
}

/**
 * Returning `false` marks the change as failed, so the setting keeps
 * its overlay open and does not commit the new value.
 */
export type SettingChangeHandler<T> = (value: T) => Promise<boolean | void> | boolean | void;

export type SettingBaseComponentProps = SettingCommonProps & {
  children?: ReactNode;
  onPress?: () => Promise<void> | void;
  onFocus?: () => void;
};
