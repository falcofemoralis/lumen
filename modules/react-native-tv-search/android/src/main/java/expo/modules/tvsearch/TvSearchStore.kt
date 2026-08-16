package expo.modules.tvsearch

import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper

/** One suggestion row: what JS published for a query and what the provider hands back. */
internal data class TvSearchRow(
  val id: String,
  val title: String,
  val subtitle: String?,
  val posterUri: String?,
  val intentData: String,
  val contentType: String?,
  val productionYear: Int?
)

/**
 * The results the suggestion provider answers from, keyed by the search query they
 * were fetched for.
 *
 * This exists because the two sides of the feature run on completely different clocks.
 * The provider is called by the system search UI on a binder thread, once per
 * keystroke, usually in a process that was just started for that call - it has a
 * budget of milliseconds. The search itself runs in JS (the listings are HTML behind a
 * proof-of-work interstitial, a hand-rolled cookie jar and runtime mirror selection),
 * takes seconds, and cannot be reimplemented natively. So the provider never waits for
 * a search: it answers from whatever is written here, kicks off the live query, and
 * [TvSearchSuggestionProvider] notifies the search UI to come back once the results land.
 *
 * Queries are normalised with [normalize] so the trivial variations the user types
 * ("Avatar", "avatar ") share one entry instead of each triggering their own fetch.
 */
internal class TvSearchStore private constructor(context: Context) : SQLiteOpenHelper(
  context.applicationContext,
  DATABASE_NAME,
  null,
  DATABASE_VERSION
) {
  private val preferences = context.applicationContext
    .getSharedPreferences(PREFERENCES_NAME, Context.MODE_PRIVATE)

  /**
   * Whether the user has the feature switched on, mirrored out of the JS config.
   *
   * Kept in preferences rather than asked of JS, because the provider has to decide
   * whether to do anything at all *before* there is a JS runtime to ask - booting one
   * per keystroke only to have it report the feature is off is precisely what this
   * avoids. Only JS ever writes it, so it stays off until the app has run once - which
   * is what keeps a freshly installed app the user has not opened yet from being
   * started by the launcher's search box, whatever the setting defaults to.
   */
  var isEnabled: Boolean
    get() = preferences.getBoolean(KEY_ENABLED, false)
    set(value) = preferences.edit().putBoolean(KEY_ENABLED, value).apply()

  companion object {
    private const val DATABASE_NAME = "tv_search.db"
    private const val DATABASE_VERSION = 1

    private const val PREFERENCES_NAME = "expo.modules.tvsearch"
    private const val KEY_ENABLED = "enabled"

    private const val TABLE_RESULTS = "results"
    private const val TABLE_QUERIES = "queries"

    private const val COLUMN_QUERY_KEY = "query_key"
    private const val COLUMN_POSITION = "position"
    private const val COLUMN_UPDATED_AT = "updated_at"
    private const val COLUMN_ID = "film_id"
    private const val COLUMN_TITLE = "title"
    private const val COLUMN_SUBTITLE = "subtitle"
    private const val COLUMN_POSTER_URI = "poster_uri"
    private const val COLUMN_INTENT_DATA = "intent_data"
    private const val COLUMN_CONTENT_TYPE = "content_type"
    private const val COLUMN_PRODUCTION_YEAR = "production_year"

    /**
     * How many queries are kept around. The cache is only there to have something to
     * show while the live search runs (and to answer a repeat of a search the user
     * just did), so it is deliberately small - stale results for a query nobody is
     * typing any more are worth nothing.
     */
    private const val MAX_CACHED_QUERIES = 50

    @Volatile
    private var instance: TvSearchStore? = null

    /**
     * The provider and the module both reach the store, from a binder thread and the
     * JS thread respectively, so there is one helper per process - `SQLiteDatabase`
     * serialises access internally, two helpers over one file would not.
     */
    fun getInstance(context: Context): TvSearchStore = instance ?: synchronized(this) {
      instance ?: TvSearchStore(context).also { instance = it }
    }

    /**
     * The cache key for a query. Case and surrounding whitespace are not worth a
     * separate fetch, and the search UI sends a query per keystroke, so collapsing
     * runs of whitespace keeps "the  matrix" from missing what "the matrix" cached.
     */
    fun normalize(query: String): String = query.trim().replace(WHITESPACE, " ").lowercase()

    private val WHITESPACE = Regex("\\s+")
  }

  override fun onCreate(db: SQLiteDatabase) {
    db.execSQL(
      """
      CREATE TABLE $TABLE_RESULTS (
        $COLUMN_QUERY_KEY TEXT NOT NULL,
        $COLUMN_POSITION INTEGER NOT NULL,
        $COLUMN_ID TEXT NOT NULL,
        $COLUMN_TITLE TEXT NOT NULL,
        $COLUMN_SUBTITLE TEXT,
        $COLUMN_POSTER_URI TEXT,
        $COLUMN_INTENT_DATA TEXT NOT NULL,
        $COLUMN_CONTENT_TYPE TEXT,
        $COLUMN_PRODUCTION_YEAR INTEGER,
        PRIMARY KEY ($COLUMN_QUERY_KEY, $COLUMN_POSITION)
      )
      """.trimIndent()
    )
    db.execSQL(
      """
      CREATE TABLE $TABLE_QUERIES (
        $COLUMN_QUERY_KEY TEXT PRIMARY KEY,
        $COLUMN_UPDATED_AT INTEGER NOT NULL
      )
      """.trimIndent()
    )
  }

  override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
    // the whole database is a cache of something that can be fetched again, so an
    // upgrade never has to migrate anything
    db.execSQL("DROP TABLE IF EXISTS $TABLE_RESULTS")
    db.execSQL("DROP TABLE IF EXISTS $TABLE_QUERIES")
    onCreate(db)
  }

  /** The published results for [queryKey], best match first, at most [limit] of them. */
  fun readRows(queryKey: String, limit: Int): List<TvSearchRow> {
    val rows = mutableListOf<TvSearchRow>()

    readableDatabase.query(
      TABLE_RESULTS,
      arrayOf(
        COLUMN_ID,
        COLUMN_TITLE,
        COLUMN_SUBTITLE,
        COLUMN_POSTER_URI,
        COLUMN_INTENT_DATA,
        COLUMN_CONTENT_TYPE,
        COLUMN_PRODUCTION_YEAR
      ),
      "$COLUMN_QUERY_KEY = ?",
      arrayOf(queryKey),
      null,
      null,
      COLUMN_POSITION,
      limit.toString()
    ).use { cursor ->
      while (cursor.moveToNext()) {
        rows.add(
          TvSearchRow(
            id = cursor.getString(0),
            title = cursor.getString(1),
            subtitle = cursor.getStringOrNull(2),
            posterUri = cursor.getStringOrNull(3),
            intentData = cursor.getString(4),
            contentType = cursor.getStringOrNull(5),
            productionYear = if (cursor.isNull(6)) null else cursor.getInt(6)
          )
        )
      }
    }

    return rows
  }

  /**
   * Replaces everything stored for [queryKey]. An empty list is stored as such: "this
   * search legitimately found nothing" has to be distinguishable from "never searched",
   * or every dead-end query would be re-run on every keystroke that follows it.
   */
  fun writeRows(queryKey: String, rows: List<TvSearchRow>) {
    val db = writableDatabase

    db.beginTransaction()

    try {
      db.delete(TABLE_RESULTS, "$COLUMN_QUERY_KEY = ?", arrayOf(queryKey))

      rows.forEachIndexed { index, row ->
        db.insert(TABLE_RESULTS, null, row.toContentValues(queryKey, index))
      }

      db.insertWithOnConflict(
        TABLE_QUERIES,
        null,
        ContentValues().apply {
          put(COLUMN_QUERY_KEY, queryKey)
          put(COLUMN_UPDATED_AT, System.currentTimeMillis())
        },
        SQLiteDatabase.CONFLICT_REPLACE
      )

      trim(db)

      db.setTransactionSuccessful()
    } finally {
      db.endTransaction()
    }
  }

  /** Whether [queryKey] was searched within [ttlMillis], i.e. re-running it would be wasted work. */
  fun isFresh(queryKey: String, ttlMillis: Long): Boolean {
    readableDatabase.query(
      TABLE_QUERIES,
      arrayOf(COLUMN_UPDATED_AT),
      "$COLUMN_QUERY_KEY = ?",
      arrayOf(queryKey),
      null,
      null,
      null
    ).use { cursor ->
      if (!cursor.moveToFirst()) {
        return false
      }

      return System.currentTimeMillis() - cursor.getLong(0) < ttlMillis
    }
  }

  fun clear() {
    val db = writableDatabase

    db.beginTransaction()

    try {
      db.delete(TABLE_RESULTS, null, null)
      db.delete(TABLE_QUERIES, null, null)
      db.setTransactionSuccessful()
    } finally {
      db.endTransaction()
    }
  }

  /** Drops everything but the [MAX_CACHED_QUERIES] most recently searched queries. */
  private fun trim(db: SQLiteDatabase) {
    val keep = """
      SELECT $COLUMN_QUERY_KEY FROM $TABLE_QUERIES
      ORDER BY $COLUMN_UPDATED_AT DESC LIMIT $MAX_CACHED_QUERIES
    """.trimIndent()

    db.execSQL("DELETE FROM $TABLE_RESULTS WHERE $COLUMN_QUERY_KEY NOT IN ($keep)")
    db.execSQL("DELETE FROM $TABLE_QUERIES WHERE $COLUMN_QUERY_KEY NOT IN ($keep)")
  }

  private fun TvSearchRow.toContentValues(queryKey: String, position: Int) = ContentValues().apply {
    put(COLUMN_QUERY_KEY, queryKey)
    put(COLUMN_POSITION, position)
    put(COLUMN_ID, id)
    put(COLUMN_TITLE, title)
    put(COLUMN_SUBTITLE, subtitle)
    put(COLUMN_POSTER_URI, posterUri)
    put(COLUMN_INTENT_DATA, intentData)
    put(COLUMN_CONTENT_TYPE, contentType)
    put(COLUMN_PRODUCTION_YEAR, productionYear)
  }

  private fun android.database.Cursor.getStringOrNull(index: Int): String? =
    if (isNull(index)) null else getString(index)
}
