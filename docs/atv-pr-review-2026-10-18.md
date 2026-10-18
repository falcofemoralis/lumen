# ATV PR review — 2026-10-18

PR: https://github.com/falcofemoralis/lumen/pull/280

## Published revision

The PR head and local HEAD both point to 7e17ea88dc5eb735bd5483373be4068291bce2a2. The reported regressions are present in the code; no wrong-head upload was identified. Uncommitted local changes are not part of that PR revision.

## Causes and changes

- ATV settings used a transparent focused background. Restore the theme focus background, text and icon contrast.
- The sidebar had lost its focus/blur opening callbacks and did not apply focused item styles. Restore remote-focus opening and closing, highlighted items and label clipping.
- Sidebar expansion combined translation with a delayed content margin change. Keep the scene geometry constant while the drawer expands over it.
- Mobile and TV shared the tab-position setting. Add a device-local TV setting defaulting to top; keep mobile positioning independent.
- Navigation-order editors replaced the settings pane and competed for focus. Embed them in a focus-scoped overlay with Back and focus restoration. Keep the settings pane mounted and remove competing list autofocus.
- Remove temporary layout logging from the ATV scroll view.

## Verification

- TypeScript noEmit passed.
- All 243 automated tests passed, including new ATV focus, pager-position and embedded-editor checks.
- Expo Windows/Web export passed.
- Isolated Electron TV-mode interaction check passed: sidebar widths 68 → 164 → 68, scene x remained 68. The ordering overlay focused its Back button. This initial focus-key-only Escape assertion was insufficient; the extended audit below caught and corrected screen dismissal in Windows TV mode.
- Targeted ESLint was run without autofix and reported 139 findings in the checked files; lint is not clean. No lint:check command was run.
- Native Android/ATV execution is not verified. The preceding Android build attempt failed before compilation because Java could not establish a loopback connection. A physical ATV remote-control check is still required before claiming release readiness.

These changes have not been committed or pushed. Existing local work was preserved.
## Extended remote-control audit

Additional reproducible defects were fixed:

- ThemedButton did not forward disabled or extraProps to its ATV pressable. The remote could activate disabled actions, and long lists lost the item index required for focus scrolling.
- ThemedPressable did not exclude disabled nodes from spatial navigation or guard remote activation.
- Local category rows and Recent grid actions did not render a visible focused state.
- ATV content-button styles used flex: 0, collapsing the New category label to a 40-pixel box. Use an automatic content basis; the measured button is now 168 pixels wide. The bookmark creation dialog used the same style and received the same fix.
- Windows TV overlays only listened for Android BackHandler events. Escape bubbled to the application and dismissed the whole screen. Add a Windows capture handler restricted to the overlay owning focus, leaving Android BackHandler unchanged.

Regression tests first reproduced disabled activation, lost button props and missing focus styles, then passed with the fixes.

Final verification:

- All 247 tests pass; TypeScript noEmit passes.
- Native Android JavaScript export and Windows/Web export pass. No new APK or EXE was packaged.
- The extended isolated TV-mode interaction run checks the ordering overlay returning to its actual settings trigger, source-list Up/Down, theme-list Down, category-manager Up, Recent grid Right, sidebar geometry and New category button width.
- The source-list entry focus works in the tested scenario; the suspected empty list-entry focus was not reproduced and was not changed.
- Targeted lint still reports existing RecentScreen formatting/import-order and unused-helper findings. No broad autofix was applied.
- adb reports no connected Android/TV device. Native IME behavior, physical remote long presses, playback/DRM and device-specific frame timing remain unverified. The TV-mode interaction test runs in Electron and does not prove native ATV correctness.

No commit, push or PR comment was created during this audit.
## Windows folder dragging

- Add mouse drag handles and drop targets to both Windows interface modes, reusing the existing category reorder/save path.
- Resolve source and target from current category IDs on drop; ignore external payloads, removed folders and self-drops.
- Exclude the drag grip from desktop swipe scrolling and the generic image-drag blocker. Native Android wrappers leave the existing touch and remote controls unchanged.
- A Chromium native mouse-drag test passed in both Windows modes: one → two, saved order two → one, reverse drag restores the original order. The test uses an isolated profile.
- Keyboard and remote reordering remain available.
## Sidebar interaction correction

The user requested scene pushing rather than an overlay drawer and icon-only accent selection. Replace the fixed overlay behavior with a stable screen-layout wrapper translated in sync with the sidebar width; no delayed margin snap or list-width relayout is needed. Route pointer clicks opt out of claiming remote focus, while remote focus still opens the menu. Only the current focused sidebar item (or active route when focus is outside the sidebar) changes icon/text color to theme.primary; selected/focused backgrounds were removed.

Verification: 251 tests and TypeScript pass. The Windows interaction run with an orange accent checks transparent backgrounds, exactly one accented icon, no expansion after clicking Bookmarks, and scene/sidebar positions 68 → 164 → 68. Remote focus opens the sidebar and moves the single accent to its focused item. Physical ATV operation remains unverified.
## Details mouse dragging and sidebar width

- Enable horizontal pointer scrolling for metadata, people and recommendation carousels in both Windows UI modes. Consume a drag without activating the underlying card or swiping a containing pager; ordinary clicks remain available. Details prose remains selectable.
- The pointer regression test reproduced zero horizontal movement before the fix. All 252 tests pass after the fix. Actual Windows mouse interaction in both modes moved actor and recommendation lists from scrollLeft 0 to 120; the current film stayed open and description selection remained enabled.
- Replace the sidebar scene's translation with an animated layout margin. Translation had moved the scene right without reducing its width, putting the right edge at 1376 in a 1280-pixel window. The regression interaction test now checks the scene's right edge too. After the fix: x=164, width=1116, right=1280; collapse restores x=68.
- The shared TV scene layout change applies to Android TV as well. Native TV runtime remains untested without a connected device.
- Updated15 packages the accumulated Windows changes, including the Back arrow added to TV-mode player controls in Updated14. Earlier builds are preserved.