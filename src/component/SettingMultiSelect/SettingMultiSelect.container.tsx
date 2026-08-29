import { useIsTV } from 'Context/ConfigContext';
import { memo, useCallback, useMemo } from 'react';

import SettingMultiSelectComponent from './SettingMultiSelect.component';
import SettingMultiSelectComponentTV from './SettingMultiSelect.component.atv';
import { SettingMultiSelectContainerProps } from './SettingMultiSelect.type';

export function SettingMultiSelectContainer({
  values,
  options,
  onChange,
  ...baseProps
}: SettingMultiSelectContainerProps) {
  const isTV = useIsTV();

  const items = useMemo(() => options.map(({ label, value }) => ({
    label,
    value,
    isChecked: values.includes(value),
  })), [options, values]);

  // The list reports one ticked box at a time; the setting is stored whole, so
  // the change is folded back into the selection here.
  const handleOnChange = useCallback((value: string, isChecked: boolean) => {
    const selected = values.filter((item) => item !== value);

    onChange(isChecked ? [...selected, value] : selected);
  }, [values, onChange]);

  const containerProps = {
    ...baseProps,
    items,
    handleOnChange,
  };

  return isTV
    ? <SettingMultiSelectComponentTV { ...containerProps } />
    : <SettingMultiSelectComponent { ...containerProps } />;
}

export default memo(SettingMultiSelectContainer);
