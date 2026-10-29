import type { LucideIcon } from 'lucide-react-native';

export type NavigationOrderItem = {
  value: string;
  label: string;
  IconComponent: LucideIcon;
};

export type NavigationOrderSettingProps = {
  title: string;
  items: NavigationOrderItem[];
  value: string[];
  hiddenItems: string[];
  onChange: (value: string[]) => void;
  onHiddenItemsChange: (value: string[]) => void;
  onBack: () => void;
  embedded?: boolean;
};