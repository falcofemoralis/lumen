import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { RefObject } from 'react';

export type LocalCategoriesOverlayMode = 'list' | 'create' | 'confirmDelete';

export interface LocalCategoryRowInterface {
  id: string;
  title: string;
  count: number;
}

export interface LocalCategoriesOverlayContainerProps {
  overlayRef: RefObject<ThemedOverlayRef | null>;
}

export interface LocalCategoriesOverlayComponentProps {
  overlayRef: RefObject<ThemedOverlayRef | null>;
  categories: LocalCategoryRowInterface[];
  mode: LocalCategoriesOverlayMode;
  deleteCandidateTitle: string;
  startCreate: () => void;
  cancelCreate: () => void;
  submitCreate: () => void;
  onChangeTitle: (title: string) => void;
  isCreateDisabled: boolean;
  requestDelete: (categoryId: string) => void;
  cancelDelete: () => void;
  confirmDelete: () => void;
  resetMode: () => void;
}
