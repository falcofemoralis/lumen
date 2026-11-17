# Windows verification

Verified during this port:
- 201 source/filter/cache/Windows regression tests passed.
- TypeScript and Expo Web export passed.
- Built portable EXE launches independently; first-run setup and Home were checked in the packaged app. Its normal data folder is created beside the EXE.
- Home, film details, ratings and live search responses from Zona, HDRezka and Anixart.
- Zona: real voice discovery and MPEG-DASH playback of Avengers: Endgame in 1080p.
- Anixart: real episode playback in 720p; Space pauses and resumes playback.
- Anixart: a downloaded HLS episode plays locally in 360p; Downloads displays its poster, title and media size.
- Fullscreen button, F11 exit and top-edge title bar reveal.
- Offline HLS keys/segments, DASH audio/video/timelines, resume and portable data relocation are covered by tests.

The HDRezka playback probe received the source's suspicious-IP response. Search did answer; successful video playback could not be confirmed on this connection. Google Drive authentication/sync requires actual Desktop OAuth credentials and was not tested with an account.

Commands:

    npm test
    npx tsc --noEmit
    npm run windows:export
    npm run windows:build

Diagnostic launch uses isolated profiles:

    $env:LUMEN_SMOKE_TEST = '1'
    $env:LUMEN_SMOKE_MODE = 'home'
    windows\node_modules\.bin\electron windows

Modes: home, film, sources, anime, rezka, offline, downloads, desktop-info, desktop-google. Film opens Avengers: Endgame from Home and chooses a Zona voice. Anime/rezka launch a live stream through existing adapters; offline downloads a short episode and opens the local file. The screenshot is windows/smoke.png. Normal portable data is not used by these profiles.

Remaining manual release checks: authenticated Drive/Rezka account actions, large imported bookmark libraries, all voice/season/episode combinations, subtitle variants and PiP, downloads interrupted by a device restart, and behavior on another Windows 11 computer. A successful build is not a substitute for those account/device-specific checks.

TV layout verified on Windows: Home opens without renderer exceptions; Right moves focus from the first to the second poster. Google OAuth PKCE callback and saved-client reuse covered by mocked-provider test; real Google sign-in still requires a Desktop OAuth client from the Lumen Google Cloud project.

Desktop film mouse-wheel regression verified in Electron: TV scrollTop 0 → 456, mobile 0 → 600. Google Drive settings click reaches OAuth and displays the setup explanation; dialog ownership and visible host-error feedback have regression tests.
