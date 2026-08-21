package expo.modules.subtitlestyle

import android.graphics.Color
import android.util.Log
import androidx.media3.common.util.UnstableApi
import androidx.media3.ui.CaptionStyleCompat
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

/**
 * What JS sends over.
 *
 * Colours are `#RRGGBB` or `#AARRGGBB` strings rather than numbers: they go through the
 * settings blob and the settings backup as they are, where a packed 32-bit int would both
 * overflow a JS number's exact integer range at full opacity and be unreadable to anyone
 * looking at an exported file.
 *
 * Every field has a default, so JS may send only what it wants to change.
 */
@UnstableApi
class SubtitleStyleRecord : Record {
  /** Text height as a fraction of the player's height, so it survives a resolution change. */
  @Field
  var textSizeFraction: Float = DEFAULT_TEXT_SIZE_FRACTION

  @Field
  var foregroundColor: String = "#FFFFFFFF"

  /** Behind the text itself, i.e. the box that hugs the glyphs. */
  @Field
  var backgroundColor: String = "#00000000"

  /** Behind the whole cue box, i.e. the full width of the line. */
  @Field
  var windowColor: String = "#00000000"

  @Field
  var edgeType: String = "outline"

  @Field
  var edgeColor: String = "#FF000000"

  /** How far above the bottom of the player the last line sits, as a fraction of its height. */
  @Field
  var bottomPaddingFraction: Float = DEFAULT_BOTTOM_PADDING_FRACTION

  fun toSubtitleStyle() = SubtitleStyle(
    textSizeFraction = textSizeFraction.coerceIn(MIN_TEXT_SIZE_FRACTION, MAX_TEXT_SIZE_FRACTION),
    bottomPaddingFraction = bottomPaddingFraction.coerceIn(0f, MAX_BOTTOM_PADDING_FRACTION),
    captionStyle = CaptionStyleCompat(
      parseColor(foregroundColor, Color.WHITE),
      parseColor(backgroundColor, Color.TRANSPARENT),
      parseColor(windowColor, Color.TRANSPARENT),
      EDGE_TYPES[edgeType] ?: CaptionStyleCompat.EDGE_TYPE_OUTLINE,
      parseColor(edgeColor, Color.BLACK),
      // null is "leave the typeface alone", which is what media3 draws cues with anyway -
      // a font is not a setting this app offers
      null
    )
  )

  private fun parseColor(color: String, fallback: Int): Int = try {
    Color.parseColor(color)
  } catch (e: IllegalArgumentException) {
    Log.w(TAG, "Ignoring unparseable colour \"$color\"", e)

    fallback
  }

  companion object {
    private const val TAG = "SubtitleStyle"

    /**
     * media3's own defaults (`SubtitleView.DEFAULT_TEXT_SIZE_FRACTION` and
     * `DEFAULT_BOTTOM_PADDING_FRACTION`), repeated rather than read so that a field JS
     * left out lands on what the player would have drawn anyway rather than on 0.
     */
    private const val DEFAULT_TEXT_SIZE_FRACTION = 0.0533f
    private const val DEFAULT_BOTTOM_PADDING_FRACTION = 0.08f

    /**
     * Text below about a fiftieth of the player's height is unreadable and above a
     * quarter of it is one word per line, so anything outside that is a mistake on the JS
     * side rather than a preference worth honouring.
     */
    private const val MIN_TEXT_SIZE_FRACTION = 0.02f
    private const val MAX_TEXT_SIZE_FRACTION = 0.25f

    /** Half the height would put the line in the middle of the picture, which is nobody's setting. */
    private const val MAX_BOTTOM_PADDING_FRACTION = 0.5f

    /**
     * How the edge of the glyphs is drawn. The keys are the JS-side spelling of media3's
     * `CaptionStyleCompat.EDGE_TYPE_*` - this is what makes white text readable on a
     * bright shot without putting a box behind it.
     */
    private val EDGE_TYPES = mapOf(
      "none" to CaptionStyleCompat.EDGE_TYPE_NONE,
      "outline" to CaptionStyleCompat.EDGE_TYPE_OUTLINE,
      "dropShadow" to CaptionStyleCompat.EDGE_TYPE_DROP_SHADOW,
      "raised" to CaptionStyleCompat.EDGE_TYPE_RAISED,
      "depressed" to CaptionStyleCompat.EDGE_TYPE_DEPRESSED
    )
  }
}

/** A style resolved into the values media3 takes, i.e. what the plugin applies. */
@UnstableApi
data class SubtitleStyle(
  val textSizeFraction: Float,
  val bottomPaddingFraction: Float,
  val captionStyle: CaptionStyleCompat
)
