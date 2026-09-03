import { DropdownItem } from 'Component/ThemedDropdown/ThemedDropdown.type';
import { useConfigContext, useIsTV } from 'Context/ConfigContext';

import PlayerSubtitlesStyleSelectorComponent from './PlayerSubtitlesStyleSelector.component';
import PlayerSubtitlesStyleSelectorComponentTV from './PlayerSubtitlesStyleSelector.component.atv';
import { PLAYER_SUBTITLES_STYLE_SETTINGS } from './PlayerSubtitlesStyleSelector.config';
import {
  PlayerSubtitlesStyleSelectorProps,
  PlayerSubtitlesStyleSettingValue,
} from './PlayerSubtitlesStyleSelector.type';

/**
 * The look of the subtitles, picked while the film is playing.
 *
 * Nothing is held here: the values are the settings screen's own, written straight to
 * the config the way that screen writes them. The style itself is pushed natively by
 * `useSubtitleStyle`, which is mounted app-wide and re-applies to the players that
 * already exist - so a change made in this overlay lands on the picture behind it right
 * away, which is the whole point of having it in the player.
 *
 * Whether the subtitles are styled by the app at all stays a settings screen decision:
 * the player only offers this while the custom style is on, so there is no switch here.
 */
export function PlayerSubtitlesStyleSelectorContainer({
  overlayRef,
  onClose,
}: PlayerSubtitlesStyleSelectorProps) {
  const isTV = useIsTV();
  const config = useConfigContext();
  const { setConfig } = config;

  // The labels are getters, so spreading them here is what translates them - during a
  // render, i.e. after i18n has been initialised and again after a language change.
  const settings: PlayerSubtitlesStyleSettingValue[] = PLAYER_SUBTITLES_STYLE_SETTINGS.map(
    (setting) => ({
      ...setting,
      value: String(config[setting.key]),
    })
  );

  const handleChange = (setting: PlayerSubtitlesStyleSettingValue, item: DropdownItem) => {
    setConfig(setting.key, setting.isNumeric ? Number(item.value) : item.value);
  };

  const containerProps = {
    overlayRef,
    settings,
    onChange: handleChange,
    onClose,
  };

  return isTV
    ? <PlayerSubtitlesStyleSelectorComponentTV { ...containerProps } />
    : <PlayerSubtitlesStyleSelectorComponent { ...containerProps } />;
}

export default PlayerSubtitlesStyleSelectorContainer;
