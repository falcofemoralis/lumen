import Loader from 'Component/Loader';
import ThemedMultiList from 'Component/ThemedMultiList';
import ThemedOverlay from 'Component/ThemedOverlay';
import { useOverlayContext } from 'Context/OverlayContext';
import t from 'i18n/t';

import { BookmarksSelectorComponentProps } from './BookmarksSelector.type';

export const BookmarksSelectorComponent = ({
  overlayId,
  data,
  isLoading,
  postBookmark,
}: BookmarksSelectorComponentProps) => {
  const { goToPreviousOverlay } = useOverlayContext();

  return (
    <ThemedOverlay
      id={ overlayId }
      onHide={ () => goToPreviousOverlay() }
    >
      <Loader
        isLoading={ isLoading }
        fullScreen
      />
      <ThemedMultiList
        header={ t('Bookmarks') }
        data={ data }
        onChange={ postBookmark }
      />
    </ThemedOverlay>
  );
};

export default BookmarksSelectorComponent;
