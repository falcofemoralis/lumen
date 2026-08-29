package expo.modules.subtitlestyle

import android.os.Handler
import android.os.Looper
import android.view.View
import androidx.media3.common.util.UnstableApi
import androidx.media3.ui.SubtitleView
import com.twg.video.core.plugins.ReactNativeVideoPlugin
import com.twg.video.view.VideoView
import java.lang.ref.WeakReference

/**
 * Styles the subtitles the player draws - their size, colour, backdrop and how far above
 * the bottom edge they sit.
 *
 * It hooks into react-native-video through its plugin API because that is the only way to
 * reach them: cues are drawn by media3's `SubtitleView`, which lives inside the
 * `PlayerView` the library builds, and react-native-video exposes neither the view nor a
 * prop for any of this.
 *
 * The style is applied once per `PlayerView` and then left alone. `PlayerView` reads the
 * system's captioning settings into its `SubtitleView` in its constructor and never
 * touches them again - every later call it makes is `setCues` - so the only moments that
 * need covering are a view appearing and the user changing a setting.
 */
@UnstableApi
class SubtitleStylePlugin : ReactNativeVideoPlugin(NAME) {
  companion object {
    const val NAME = "SubtitleStyle"
  }

  private val handler = Handler(Looper.getMainLooper())

  /**
   * Views rather than players, because the `SubtitleView` belongs to the view: a player
   * handed to a second view (going fullscreen, entering picture in picture) draws its
   * cues into that view's `SubtitleView`, not the one it started in.
   */
  private val views = mutableListOf<WeakReference<VideoView>>()

  /** `null` means the system's own captioning settings, i.e. what media3 would draw. */
  @Volatile
  private var style: SubtitleStyle? = null

  /** Shared by every view, since one style is applied to all of them. */
  private val bottomPadding = BottomPadding()

  override fun onVideoViewCreated(view: WeakReference<VideoView>) {
    handler.post {
      views.add(view)

      view.get()?.let { apply(it) }
    }
  }

  override fun onVideoViewDestroyed(view: WeakReference<VideoView>) {
    val destroyed = view.get()

    handler.post {
      views.removeAll { it.get() == null || it.get() === destroyed }
    }
  }

  /**
   * Takes the style JS holds. Passing `null` hands the subtitles back to the system's
   * captioning settings, which is what the player would have drawn had this never run.
   */
  fun setStyle(style: SubtitleStyle?) {
    this.style = style

    handler.post {
      liveViews().forEach { apply(it) }
    }
  }

  private fun apply(view: VideoView) {
    // read through the view every time: the PlayerView is rebuilt when the surface type
    // changes, and the one this was handed at creation would be the wrong one by then
    val subtitleView = view.playerView.subtitleView ?: return
    val style = this.style

    // one listener per view, and exactly one: removing first makes re-applying a style to
    // a view that already has it a no-op rather than a second listener on the same view
    subtitleView.removeOnLayoutChangeListener(bottomPadding)
    subtitleView.addOnLayoutChangeListener(bottomPadding)

    if (style == null) {
      subtitleView.setApplyEmbeddedStyles(true)
      subtitleView.setApplyEmbeddedFontSizes(true)
      subtitleView.setUserDefaultStyle()
      subtitleView.setUserDefaultTextSize()
      subtitleView.setBottomPaddingFraction(SubtitleView.DEFAULT_BOTTOM_PADDING_FRACTION)

      bottomPadding.fraction = 0f
      bottomPadding.apply(subtitleView)

      return
    }

    // A cue carrying its own colours or size wins over everything set here unless both of
    // these are off, and the WebVTT files this app plays carry both often enough that
    // leaving them on would make the whole feature look broken. What the cue says about
    // where it goes is kept - only its colours, its font sizes and the styling spans in
    // its text are dropped.
    subtitleView.setApplyEmbeddedStyles(false)
    subtitleView.setApplyEmbeddedFontSizes(false)

    subtitleView.setStyle(style.captionStyle)
    subtitleView.setFractionalTextSize(style.textSizeFraction)

    // Zero, because the padding below is what moves the subtitles up - see [BottomPadding].
    // Leaving both on would move the cues that do go through this by twice the setting.
    subtitleView.setBottomPaddingFraction(0f)

    bottomPadding.fraction = style.bottomPaddingFraction
    bottomPadding.apply(subtitleView)
  }

  private fun liveViews(): List<VideoView> {
    views.removeAll { it.get() == null }

    return views.mapNotNull { it.get() }
  }
}

/**
 * Moves the subtitles up from the bottom edge by padding the view they are drawn in.
 *
 * `SubtitleView.setBottomPaddingFraction` looks like the call for this and is not:
 * media3 only honours it for cues that carry no line position of their own, and the
 * WebVTT parser gives every cue the default line - the last line of the box - so for
 * everything this app plays the fraction is read and then never used. Padding shrinks the
 * box each cue is laid out in instead, which moves the line-positioned ones with it.
 *
 * The padding is a fraction of the view's height rather than a distance, and that view is
 * the picture (media3 puts the subtitles inside the aspect ratio frame, not over the whole
 * window), so it has to be recomputed whenever the picture is laid out again - going
 * fullscreen, entering picture in picture, playing a video of a different shape.
 *
 * Nothing here holds the view: the listener is held *by* the view, and the one place that
 * needs it outside a layout pass passes it in.
 */
private class BottomPadding : View.OnLayoutChangeListener {
  var fraction: Float = 0f

  override fun onLayoutChange(
    view: View,
    left: Int,
    top: Int,
    right: Int,
    bottom: Int,
    oldLeft: Int,
    oldTop: Int,
    oldRight: Int,
    oldBottom: Int
  ) {
    apply(view)
  }

  fun apply(view: View) {
    val padding = (view.height * fraction).toInt()

    // Padding asks for another layout pass, which lands back here - so this both keeps
    // that pass from being asked for at all and stops the two from feeding each other.
    // The height cannot change with it, the padding being inside the view.
    if (view.paddingBottom == padding) {
      return
    }

    view.setPadding(view.paddingLeft, view.paddingTop, view.paddingRight, padding)
  }
}
