import { DEFAULT_SUBTITLES_EDGE_TYPE } from 'Component/Player/Player.config';
import { useConfigContext } from 'Context/ConfigContext';
import {
  DEFAULT_TEXT_SIZE_FRACTION,
  reactNativeSubtitleStyle,
  SubtitleEdgeType,
} from 'Modules/react-native-subtitle-style';
import { useEffect } from 'react';

/** The edge is what separates the glyphs from the picture, so it is drawn in the opposite. */
const EDGE_COLOR = '#FF000000';

const EDGE_TYPES = Object.values(SubtitleEdgeType) as string[];

const getEdgeType = (edgeType: string): SubtitleEdgeType => (
  EDGE_TYPES.includes(edgeType)
    ? edgeType as SubtitleEdgeType
    : DEFAULT_SUBTITLES_EDGE_TYPE as SubtitleEdgeType
);

/**
 * Keeps the look of the player's subtitles in step with the settings.
 *
 * There is nothing to render here. Cues are drawn by media3 inside react-native-video's
 * own view, which exposes no prop for their size or colour, so the whole feature runs
 * natively off the library's plugin API - this only says what it should look like.
 *
 * Applied on mount as well as on change, and app-wide rather than in the player: the
 * style lives on the native side, which does not survive a restart, and the player that
 * has to pick it up may not be the one open when the setting was changed.
 */
export const useSubtitleStyle = () => {
  const {
    playerSubtitlesCustomStyle,
    playerSubtitlesSizeScale,
    playerSubtitlesColor,
    playerSubtitlesBackgroundColor,
    playerSubtitlesEdgeType,
    playerSubtitlesBottomOffset,
  } = useConfigContext();

  useEffect(() => {
    // Off is not a style of its own: the device has its own captioning settings, and
    // handing the subtitles back to them is the only way to honour those.
    if (!playerSubtitlesCustomStyle) {
      reactNativeSubtitleStyle.reset();

      return;
    }

    reactNativeSubtitleStyle.setStyle({
      textSizeFraction: DEFAULT_TEXT_SIZE_FRACTION * playerSubtitlesSizeScale,
      foregroundColor: playerSubtitlesColor,
      backgroundColor: playerSubtitlesBackgroundColor,
      edgeType: getEdgeType(playerSubtitlesEdgeType),
      edgeColor: EDGE_COLOR,
      bottomPaddingFraction: playerSubtitlesBottomOffset,
    });
  }, [
    playerSubtitlesCustomStyle,
    playerSubtitlesSizeScale,
    playerSubtitlesColor,
    playerSubtitlesBackgroundColor,
    playerSubtitlesEdgeType,
    playerSubtitlesBottomOffset,
  ]);
};
