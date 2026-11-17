# Network and UI performance investigation — 2026-10-17

## Findings and changes

| Symptom | Confirmed code path | Change | Verification |
| --- | --- | --- | --- |
| Gateway failures and stalled requests | Common request error handling ignored 504. Rezka customFetch had no overall transport/body deadline. Concurrent Zona text calls were not coalesced. | HTTP 5xx is rejected before parsing; shared text transport limits each origin to three active requests and 64 queued requests, including a body/queue deadline. Identical GETs without independent cancellation share an in-flight result; account headers remain part of the key. GET/HEAD gateway failures get at most one delayed retry with jitter; POST is never retried by this policy. | Gateway response, stalled body, ignored abort, queue cancellation, concurrency and account-isolation regression tests. External server-side cause of an actual 504 cannot be established from this repository. |
| Delayed remote bookmark appearance | Overlay updated state only in onSuccess and invalidated all active bookmark lists after success. | Optimistic cache updates after cancelling competing reads, with saved cache/overlay state restored on error. Invalidation marks lists stale without immediately downloading every folder. | Test invokes the actual container mutation callbacks with QueryClient: poster appears before a server call, failure restores prior state, and invalidation does not start fetching. Local bookmarks were already persisted locally before cloud network synchronization. |
| Windows UI stalls | Every MMKV-compatible write used synchronous IPC and a synchronous file write before notifying subscribers. | In-memory updates notify immediately; a per-store 50 ms buffer coalesces writes using asynchronous IPC. Pending data has a synchronous close/pagehide flush. Main-process atomic disk writes are still serialized and synchronous; they are no longer awaited by renderer mutations. | Tests cover burst coalescing, a pending write with a newer value, and final synchronous flush. No claim of a full frame-time benchmark on the user's library. |
| Blank/late posters during scrolling | Every viewability notification replaced its Set; every enriched list recreated cell item objects; failed prefetches were treated as cached for five minutes. Data updates also restarted look-ahead at the first row. | Avoid unchanged visibility updates, compare memoized card props by item values, retry failed prefetches, and keep the current look-ahead position. | Memo comparator and prefetch regression tests; native black-cell behavior still requires Android/ATV device reproduction. Existing fixed poster aspect ratios, memory/disk image caching and FlashList recycling retained. |
| Slow tab transitions and background work | Obsolete preferred-card query loops kept running after query-key replacement. Rejected enrichment promises remained cached for five minutes and the lightweight promise map had no size bound. | Consumed query cancellation signal stops future work and stale publication; rejected promises are evicted and the lightweight cache is capped. | TypeScript, existing source/cache tests and Windows startup smoke check. Running source calls finish or hit their transport deadline; adapters without a signal are not claimed to support immediate screen-exit cancellation. |

## Scope and existing behavior

No playback, voice selection, source priority, persistent cache TTL, cloud merge policy or navigation architecture was rewritten. Bookmarks still scan all folders. Existing image placeholders, dimensions, tab keep-alive and catalog caches are retained. No third-party server code or proxy configuration is available here.

The Windows source files changed before this investigation for stable dock identity/folder builds remain present; these were existing user work.

## Validation

- 237 regression tests passed after the fixes, including the new network, optimistic bookmark, storage-buffer and grid tests.
- TypeScript noEmit passed.
- Expo Web/Windows export passed; portable Windows packaging was run separately.
- ESLint dependencies were incomplete locally. Missing files were restored from official npm packages of the already installed versions, without changing manifests/lockfiles. ESLint then ran; existing violations remain in touched legacy files. New helper modules lint clean.
- Android assembleRelease was attempted with NODE_ENV=production; Gradle failed before compilation because its Java process could not establish a loopback connection. No new Android APK is claimed.
- Real-device Android/ATV memory, rapid-scroll frame times and upstream 504 frequency remain unmeasured. These are required to validate the reported device-specific symptoms fully.