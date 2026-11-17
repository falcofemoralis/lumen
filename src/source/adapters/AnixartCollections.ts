import { ContentCollectionInterface } from 'Type/ContentCollection.interface';
import { ANIXART_BASE_URL, requestAnixart } from './AnixartApi';

interface Collection { id: number; title: string; image?: string; releases_count?: number; is_private?: boolean; is_deleted?: boolean }
export const getAnixartCollections = async (page: number): Promise<{ items: ContentCollectionInterface[]; totalPages: number }> => {
  const data = await requestAnixart<{ content?: Collection[]; total_page_count?: number }>('/collection/all/' + Math.max(0, page - 1) + '?sort=0&where=1');
  return {
    items: (data.content ?? []).filter(item => !item.is_deleted && !item.is_private).map(item => ({
      id: 'ANIXART:collection:' + item.id, title: item.title, image: item.image ?? '',
      url: ANIXART_BASE_URL + '/collection/' + item.id, amount: item.releases_count ?? 0, source: 'Anixart',
    })),
    totalPages: data.total_page_count && data.total_page_count > 0 ? Math.max(page, data.total_page_count) : (data.content?.length ?? 0) >= 25 ? page + 1 : page,
  };
};
