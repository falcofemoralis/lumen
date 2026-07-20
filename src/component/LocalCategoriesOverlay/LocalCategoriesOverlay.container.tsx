import { useConfigContext } from 'Context/ConfigContext';
import { useLocalBookmarks } from 'Hooks/useLocalLibrary';
import { t } from 'i18n/translate';
import { useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import { createLocalCategory, deleteLocalCategory } from 'Util/LocalLibrary';

import LocalCategoriesOverlayComponent from './LocalCategoriesOverlay.component';
import LocalCategoriesOverlayComponentTV from './LocalCategoriesOverlay.component.atv';
import {
  LocalCategoriesOverlayContainerProps,
  LocalCategoriesOverlayMode,
  LocalCategoryRowInterface,
} from './LocalCategoriesOverlay.type';

export const LocalCategoriesOverlayContainer = ({
  overlayRef,
}: LocalCategoriesOverlayContainerProps) => {
  const { isTV } = useConfigContext();
  const localBookmarks = useLocalBookmarks();
  const [mode, setMode] = useState<LocalCategoriesOverlayMode>('list');
  const [newTitle, setNewTitle] = useState('');
  const [deleteCandidate, setDeleteCandidate] = useState<LocalCategoryRowInterface | null>(null);

  const categories: LocalCategoryRowInterface[] = localBookmarks.categories.map((category) => ({
    id: category.id,
    title: category.title,
    count: category.filmIds.length,
  }));

  const startCreate = () => {
    setNewTitle('');
    setMode('create');
  };

  const cancelCreate = () => {
    setNewTitle('');
    setMode('list');
  };

  const submitCreate = () => {
    const error = createLocalCategory(newTitle);

    if (error === 'exists') {
      NotificationStore.displayMessage(t('Category already exists'));

      return;
    }

    if (!error) {
      setNewTitle('');
      setMode('list');
    }
  };

  const requestDelete = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);

    if (!category) {
      return;
    }

    setDeleteCandidate(category);
    setMode('confirmDelete');
  };

  const cancelDelete = () => {
    setDeleteCandidate(null);
    setMode('list');
  };

  const confirmDelete = () => {
    if (deleteCandidate) {
      deleteLocalCategory(deleteCandidate.id);
    }

    setDeleteCandidate(null);
    setMode('list');
  };

  const resetMode = () => {
    setDeleteCandidate(null);
    setNewTitle('');
    setMode('list');
  };

  const containerProps = {
    overlayRef,
    categories,
    mode,
    deleteCandidateTitle: deleteCandidate?.title ?? '',
    startCreate,
    cancelCreate,
    submitCreate,
    onChangeTitle: setNewTitle,
    isCreateDisabled: !newTitle.trim(),
    requestDelete,
    cancelDelete,
    confirmDelete,
    resetMode,
  };

  // eslint-disable-next-line max-len
  return isTV ? <LocalCategoriesOverlayComponentTV { ...containerProps } /> : <LocalCategoriesOverlayComponent { ...containerProps } />;
};

export default LocalCategoriesOverlayContainer;
