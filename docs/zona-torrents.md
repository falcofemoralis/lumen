# Zona torrent playback

The optional setting "Enable Zona torrents" is off by default. Website playback
is unchanged. Desktop-only titles and TV shows are added when the setting is on.
No torrent engine starts during scrolling, searching, metadata lookup or voice discovery.

The built-in engine is TorrServer MatriX.147.2. Build scripts fetch the official
binaries and verify pinned SHA-256 digests. Windows packaging includes a separate
process with embedded GStreamer for MKV-to-HLS playback. Android packages the
executable as an extracted native library for each supported ABI; do not strip it.
No separate server installation or user configuration is required.

- Android: 64 MiB; Windows: 96 MiB per active torrent. Disk torrent caching is disabled.
- Media streams through the existing Lumen player. Downloads explicitly copy the
  selected original file into the configured downloads folder and survive engine shutdown.
- The engine binds its API to loopback and uses a fresh local Basic credential.
- Only a selected release starts peer activity. Metadata and voice discovery use
  the Zona catalog, with request deduplication and a bounded short-lived cache.
- Torrent groups share verified translation/quality metadata. The voice selector selects
  releases; it does not identify every unnamed audio track inside a multi-track file. Seasons and episodes
  come from Zona's explicit episode map or SxxExx filenames. File indices are matched
  to actual torrent metadata; ambiguous matches are rejected.
- Availability, start latency, container/codec support and seeking depend on peers,
  the release and the playback platform. A zero-seeder torrent can fail or time out.
- Local stream URLs and credentials expire when Lumen exits. Interrupted torrent
  downloads may need to be started again from the selector after an application restart.

Windows development: run `node scripts/prepare-torrent-engine.cjs windows` once
before `npm run windows:start`. Release build scripts run preparation automatically.
Android's module preBuild task prepares only the selected reactNativeArchitectures.
Downloaded binaries and temporary build files are ignored by Git.
Release APK packaging needs additional heap for the native engines and ABI splits.
The withReleaseBuildMemory config plugin sets a minimum 4 GiB Gradle heap and a
default of two workers, preserving larger heaps and explicit worker limits.

Third-party notices and exact corresponding source links: third-party/TorrServer.

Validation uses deterministic fake catalog/engine responses plus an optional local
synthetic-video smoke test; it must not start arbitrary copyrighted torrent downloads.

The local test uses an incoming plaintext peer to avoid implementing MSE in the
fixture. Production peer encryption remains controlled by TorrServer's normal policy.

Playback waits for engine preload and a bounded byte-range probe before exposing
the local stream to the player. Android allows a longer read timeout only for these
loopback torrent streams; ordinary online streams retain their existing timeout.
Known-size release bumpers and samples are excluded without guessing between
similarly sized films. A website entry with no online voices may fall back to
torrents only when the local torrent setting is enabled.

The universal APK contains four native engines. Prefer the matching ABI APK
(e.g. arm64-v8a for most modern phones) to avoid shipping unused architectures.
