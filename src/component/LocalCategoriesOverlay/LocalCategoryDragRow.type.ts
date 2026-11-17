import { ReactNode } from 'react';

export interface LocalCategoryDragRowProps {
  categoryId: string;
  categoryIds: string[];
  onReorder: (fromIndex: number, toIndex: number) => void;
  children: ReactNode;
}