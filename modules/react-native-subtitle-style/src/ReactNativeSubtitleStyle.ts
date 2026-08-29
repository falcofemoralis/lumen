import ReactNativeSubtitleStyleModule from './ReactNativeSubtitleStyleModule';

/** How the edge of the glyphs is drawn, i.e. what separates them from the picture. */
export enum SubtitleEdgeType {
  NONE = 'none',
  OUTLINE = 'outline',
  DROP_SHADOW = 'dropShadow',
  RAISED = 'raised',
  DEPRESSED = 'depressed',
}

/**
 * media3's own defaults. Worth keeping to hand: they are what the subtitles look like
 * before any of this is applied, so they are the sensible middle of every scale below.
 */
export const DEFAULT_TEXT_SIZE_FRACTION = 0.0533;
export const DEFAULT_BOTTOM_PADDING_FRACTION = 0.08;

export interface SubtitleStyle {
  /**
   * Text height as a fraction of the player's height rather than a point size, so the
   * same setting reads the same on a phone and on a 4K TV. Clamped natively to
   * 0.02 - 0.25.
   */
  textSizeFraction: number;
  /** `#RRGGBB` or `#AARRGGBB`. */
  foregroundColor: string;
  /** Behind the text itself, i.e. the box that hugs the glyphs. */
  backgroundColor: string;
  /** Behind the whole cue box, i.e. the full width of the line. */
  windowColor: string;
  edgeType: SubtitleEdgeType;
  edgeColor: string;
  /**
   * How far above the bottom of the picture the last line sits, as a fraction of its
   * height. Clamped natively to 0 - 0.5.
   */
  bottomPaddingFraction: number;
}

/**
 * The look of the subtitles the player draws.
 *
 * Subtitles are rendered by media3 inside react-native-video's own view, which exposes no
 * prop for any of this, so the style is pushed natively through the library's plugin API
 * instead - see `SubtitleStylePlugin`. Nothing is drawn on the JS side and nothing comes
 * back: this is a one-way switch that the next player to appear picks up.
 *
 * Two things follow from styling cues that were written with their own styling:
 *
 * - Colours, font sizes and styling tags baked into a WebVTT file are ignored while a
 *   style is set. Where a cue says it goes is still honoured, so a track that places text
 *   around the picture keeps doing that - only its look is taken over.
 * - Android's own captioning settings are overridden. {@link reset} is what gives them
 *   back, which is what the settings switch is for.
 */
class ReactNativeSubtitleStyle {
  /**
   * Applies a style to every player from here on, including ones that do not exist yet -
   * the native side holds it, so this is called once per change rather than per player.
   *
   * Anything left out falls back to what media3 draws by default.
   */
  setStyle(style: Partial<SubtitleStyle>): void {
    ReactNativeSubtitleStyleModule.setStyle(style);
  }

  /** Hands the subtitles back to the device's own captioning settings. */
  reset(): void {
    ReactNativeSubtitleStyleModule.resetStyle();
  }
}

export const reactNativeSubtitleStyle = new ReactNativeSubtitleStyle();
