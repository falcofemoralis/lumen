import { DropdownItem } from 'Component/ThemedDropdown/ThemedDropdown.type';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { RefObject } from 'react';

import { PlayerSubtitlesStyleSetting } from './PlayerSubtitlesStyleSelector.config';

export interface PlayerSubtitlesStyleSelectorProps {
  overlayRef: RefObject<ThemedOverlayRef | null>;
  onClose?: () => void;
}

/** A setting together with the value the config holds for it, as the dropdown reads it. */
export type PlayerSubtitlesStyleSettingValue = PlayerSubtitlesStyleSetting & {
  value: string;
};

export interface PlayerSubtitlesStyleSelectorComponentProps extends PlayerSubtitlesStyleSelectorProps {
  settings: PlayerSubtitlesStyleSettingValue[];
  onChange: (setting: PlayerSubtitlesStyleSettingValue, item: DropdownItem) => void;
}
