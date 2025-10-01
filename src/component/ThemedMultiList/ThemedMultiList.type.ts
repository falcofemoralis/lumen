export interface ThemedMultiListContainerProps {
  data: ListItem[],
  header?: string;
  noItemsTitle?: string;
  noItemsSubtitle?: string;
  onChange: (value: string, isChecked: boolean) => void;
}

export interface ThemedMultiListComponentProps {
  values: ListItem[],
  header?: string;
  noItemsTitle?: string;
  noItemsSubtitle?: string;
  handleOnChange: (value: string, isChecked: boolean) => void;
}

export interface ListItem {
  label: string;
  value: string;
  isChecked: boolean;
}
