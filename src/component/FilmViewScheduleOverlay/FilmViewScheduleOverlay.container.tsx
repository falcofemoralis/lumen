import { ThemedBottomSheetRef } from 'Component/ThemedBottomSheet/ThemedBottomSheet.type';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { useIsTV } from 'Context/ConfigContext';
import { RefObject } from 'react';

import FilmViewScheduleOverlayComponent from './FilmViewScheduleOverlay.component';
import FilmViewScheduleOverlayComponentTV from './FilmViewScheduleOverlay.component.atv';
import {
  FilmViewScheduleOverlayContainerProps,
  FilmViewScheduleOverlayRef,
} from './FilmViewScheduleOverlay.type';

export function FilmViewScheduleOverlayContainer<T extends FilmViewScheduleOverlayRef>({
  ref,
  ...props
}: FilmViewScheduleOverlayContainerProps<T>) {
  const isTV = useIsTV();

  // Each platform renders a different overlay primitive, so the caller owns the
  // matching ref type - TV passes ThemedOverlayRef, mobile passes ThemedBottomSheetRef.
  return isTV
    ? (
      <FilmViewScheduleOverlayComponentTV
        ref={ ref as RefObject<ThemedOverlayRef | null> }
        { ...props }
      />
    )
    : (
      <FilmViewScheduleOverlayComponent
        ref={ ref as RefObject<ThemedBottomSheetRef | null> }
        { ...props }
      />
    );
}

export default FilmViewScheduleOverlayContainer;
