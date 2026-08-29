package expo.modules.tvchannels

import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

/**
 * One row on the Android TV home screen.
 *
 * [providerId] is stored as the channel's INTERNAL_PROVIDER_ID and is what a sync
 * matches on, so it has to be stable across app launches (the TvProvider row id is
 * not known to JS).
 */
class TvChannelSpec : Record {
  @Field
  val providerId: String = ""

  @Field
  val displayName: String = ""

  @Field
  val description: String? = null

  /** Opened when the user selects the channel logo. Falls back to launching the app. */
  @Field
  val appLinkIntentUri: String? = null

  /** Square, opaque logo. The app icon is used when this is not given. */
  @Field
  val logoUri: String? = null

  @Field
  val programs: List<TvProgramSpec> = emptyList()
}

/**
 * One card inside a channel. [providerId] only has to be unique within its channel;
 * it is what lets a re-sync recognise a card it already published instead of
 * dropping and re-adding it (which would lose its position and cached artwork).
 */
class TvProgramSpec : Record {
  @Field
  val providerId: String = ""

  @Field
  val title: String = ""

  /** Sent as-is when the card is selected, so it has to resolve to this app. */
  @Field
  val intentUri: String = ""

  @Field
  val description: String? = null

  @Field
  val posterArtUri: String? = null

  /** `movie` (default), `tv_series`, `tv_episode` or `clip`. */
  @Field
  val type: String? = null

  /** `movie_poster` (default), `16_9`, `3_2`, `4_3`, `1_1` or `2_3`. */
  @Field
  val posterArtAspectRatio: String? = null

  /** ISO 8601 date or a plain year. */
  @Field
  val releaseDate: String? = null

  @Field
  val genre: String? = null

  @Field
  val live: Boolean = false
}
