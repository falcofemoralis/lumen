package expo.modules.focusscroll

import android.animation.Animator
import android.animation.AnimatorListenerAdapter
import android.animation.ObjectAnimator
import android.os.Handler
import android.os.Looper
import android.view.View
import android.view.animation.AccelerateDecelerateInterpolator
import android.view.animation.Interpolator
import android.view.animation.PathInterpolator
import com.facebook.react.uimanager.PixelUtil
import com.facebook.react.views.scroll.ReactScrollView
import expo.modules.kotlin.functions.Queues
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlin.math.roundToInt

/**
 * Scrolls a scroll view to an offset over a duration and an easing curve of the caller's
 * choosing.
 *
 * React Native can already scroll a list programmatically, but never at a speed the app
 * decides: `scrollTo({ animated: true })` runs a fixed 250ms `AccelerateDecelerateInterpolator`
 * (`ReactScrollView.DEFAULT_FLING_ANIMATOR`), and neither the duration nor the curve is
 * reachable from JS. This is that same mechanism -- an `ObjectAnimator` on the view's
 * `scrollY` -- with both of them handed in.
 *
 * Doing it here rather than by pushing a value per frame from JS is the point: the whole
 * animation runs on the UI thread in one place, so no frame of it depends on the JS thread
 * being free, and the scroll events the list virtualises on are emitted natively exactly as
 * they are for any other scroll.
 */
class ReactNativeFocusScrollModule : Module() {
  /**
   * The animation currently running per scroll view, so that the next scroll of the same
   * view can call off the one it is replacing -- two animators driving one property would
   * otherwise fight over every frame. Entries are short lived: each one drops itself when
   * its animation ends, cancelled or not.
   */
  private val animators = mutableMapOf<Int, ObjectAnimator>()

  private val mainHandler = Handler(Looper.getMainLooper())

  override fun definition() = ModuleDefinition {
    Name("ReactNativeFocusScroll")

    /**
     * Scrolls the view with the given tag to `offset`, and answers whether it could: a
     * `false` means the tag resolved to nothing, which is the caller's cue to scroll the
     * list some other way rather than to wait for something that will not happen.
     *
     * `duration` is in ms, and `easing` is a cubic bezier as its two control points --
     * `[x1, y1, x2, y2]`, the same four numbers CSS takes.
     */
    AsyncFunction("scrollTo") { viewTag: Int, offset: Double, duration: Int, easing: List<Double> ->
      val view = appContext.findView<View>(viewTag) ?: return@AsyncFunction false

      // A fling the view started itself drives the same property from the same thread,
      // so it has to be called off too, not just the animation we own.
      (view as? ReactScrollView)?.abortAnimation()
      animators.remove(viewTag)?.cancel()

      // JS measures in density-independent points and `scrollY` in device pixels, so an
      // offset handed straight over would scroll a fraction of the way on any screen
      // denser than 1x. This is the conversion `scrollTo` itself does on its way in.
      //
      // `View.setScrollY` then goes through `ScrollView.scrollTo`, which clamps to the
      // content -- so an offset past the end of the list settles at the end of the list.
      val target = PixelUtil.toPixelFromDIP(offset).roundToInt()

      if (duration <= 0) {
        view.scrollY = target

        return@AsyncFunction true
      }

      val animator = ObjectAnimator.ofInt(view, "scrollY", view.scrollY, target)

      animator.duration = duration.toLong()
      animator.interpolator = easing.toInterpolator()
      animator.addListener(object : AnimatorListenerAdapter() {
        override fun onAnimationEnd(animation: Animator) {
          // Only if it is still ours: a scroll that replaced this one has already put
          // itself in the map by the time a cancelled animation reports back.
          if (animators[viewTag] === animator) {
            animators.remove(viewTag)
          }
        }
      })

      animators[viewTag] = animator
      animator.start()

      true
    }.runOnQueue(Queues.MAIN)

    OnDestroy {
      // An animation outliving the runtime that asked for it would go on scrolling a
      // list nothing can steer any more, e.g. across a reload in development.
      mainHandler.post {
        // Copied first: cancelling reports back through the listener above, which
        // reaches into the very map that would otherwise be under iteration.
        animators.values.toList().forEach { it.cancel() }
        animators.clear()
      }
    }
  }
}

/**
 * The four control-point coordinates as an interpolator. Anything else -- a curve of the
 * wrong length -- falls back to the one a plain `scrollTo({ animated: true })` would have
 * used, so a bad curve costs the easing rather than the scroll.
 */
private fun List<Double>.toInterpolator(): Interpolator {
  if (size != CUBIC_BEZIER_LENGTH) {
    return AccelerateDecelerateInterpolator()
  }

  return PathInterpolator(
    // Only the control points' time coordinates are bounded: a curve reaching outside
    // 0..1 on that axis is not a function of time and `PathInterpolator` rejects it,
    // while overshooting on the value axis is a legitimate curve.
    this[0].toFloat().coerceIn(0f, 1f),
    this[1].toFloat(),
    this[2].toFloat().coerceIn(0f, 1f),
    this[3].toFloat()
  )
}

private const val CUBIC_BEZIER_LENGTH = 4
