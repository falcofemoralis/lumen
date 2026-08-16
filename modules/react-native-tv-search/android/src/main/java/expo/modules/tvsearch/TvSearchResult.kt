package expo.modules.tvsearch

import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

/**
 * One card in the Android TV global search results, as JS publishes it after a search.
 *
 * The fields map onto the `SearchManager.SUGGEST_COLUMN_*` columns the search UI reads;
 * see [TvSearchSuggestionProvider].
 */
class TvSearchResult : Record {
  /** Only has to be unique within its query - it is what keeps duplicate hits apart. */
  @Field
  val id: String = ""

  @Field
  val title: String = ""

  /** Fired as an ACTION_VIEW when the card is selected, so it has to resolve to this app. */
  @Field
  val intentData: String = ""

  @Field
  val subtitle: String? = null

  @Field
  val posterUri: String? = null

  /** Mime type of what the card leads to, ex. `video/mp4`. */
  @Field
  val contentType: String? = null

  @Field
  val productionYear: Int? = null
}
