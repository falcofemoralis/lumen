import { DragEvent, ReactNode, useEffect, useState } from 'react';
import { useAppTheme } from 'Theme/context';

import { LocalCategoryDragRowProps } from './LocalCategoryDragRow.type';

const CATEGORY_DRAG_TYPE = 'application/x-lumen-bookmark-category';

export const LocalCategoryDragHandle = ({ categoryId, children }: { categoryId: string; children: ReactNode }) => (
  <div
    draggable
    data-lumen-folder-drag-handle={ categoryId }
    style={ { cursor: 'grab', display: 'flex', alignItems: 'center' } }
    onDragStart={ (event) => {
      event.stopPropagation();
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData(CATEGORY_DRAG_TYPE, categoryId);
    } }
  >
    { children }
  </div>
);

export const LocalCategoryDragRow = ({ categoryId, categoryIds, onReorder, children }: LocalCategoryDragRowProps) => {
  const [isOver, setIsOver] = useState(false);
  const { theme } = useAppTheme();

  useEffect(() => {
    const reset = () => setIsOver(false);
    document.addEventListener('dragend', reset);

    return () => document.removeEventListener('dragend', reset);
  }, []);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    setIsOver(false);
    if (!event.dataTransfer.types.includes(CATEGORY_DRAG_TYPE)) return;

    event.preventDefault();
    event.stopPropagation();
    const fromIndex = categoryIds.indexOf(event.dataTransfer.getData(CATEGORY_DRAG_TYPE));
    const toIndex = categoryIds.indexOf(categoryId);

    if (fromIndex >= 0 && toIndex >= 0 && fromIndex !== toIndex) {
      onReorder(fromIndex, toIndex);
    }
  };

  return (
    <div
      data-lumen-folder-drop={ categoryId }
      style={ { width: '100%', outline: isOver ? `2px solid ${theme.colors.primary}` : undefined, borderRadius: 4 } }
      onDragOver={ (event) => {
        if (!event.dataTransfer.types.includes(CATEGORY_DRAG_TYPE)) return;

        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        setIsOver(true);
      } }
      onDragLeave={ () => setIsOver(false) }
      onDrop={ handleDrop }
    >
      { children }
    </div>
  );
};