import { ThemedBottomSheetRef } from 'Component/ThemedBottomSheet/ThemedBottomSheet.type';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { RefObject } from 'react';
import { FilmInterface } from 'Type/Film.interface';
import { ScheduleItemInterface } from 'Type/ScheduleItem.interface';

export type FilmViewScheduleOverlayRef = ThemedOverlayRef | ThemedBottomSheetRef;

export interface FilmViewScheduleOverlayContainerProps<
  T extends FilmViewScheduleOverlayRef = FilmViewScheduleOverlayRef,
> {
  ref: RefObject<T | null>;
  film: FilmInterface;
  handleUpdateScheduleWatch: (scheduleItem: ScheduleItemInterface) => Promise<boolean>;
}

export type FilmViewScheduleOverlayComponentProps<T extends FilmViewScheduleOverlayRef> =
  FilmViewScheduleOverlayContainerProps<T>;
