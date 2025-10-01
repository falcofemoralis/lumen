import Loader from 'Component/Loader';
import ThemedMultiList from 'Component/ThemedMultiList';
import ThemedOverlay from 'Component/ThemedOverlay';
import t from 'i18n/t';

import { BookmarksOverlayComponentProps } from './BookmarksOverlay.type';

export const BookmarksOverlayComponent = ({
  overlayRef,
  items,
  isLoading,
  postBookmark,
  onClose,
}: BookmarksOverlayComponentProps) => {
  return (
    <ThemedOverlay
      ref={ overlayRef }
      onClose={ onClose }
    >
      <Loader
        isLoading={ isLoading }
        fullScreen
      />
      <ThemedMultiList
        header={ t('Bookmarks') }
        data={ items }
        onChange={ postBookmark }
        noItemsTitle={ t('No bookmarks group') }
        noItemsSubtitle={ t('Go to site and create bookmarks group') }
      />
    </ThemedOverlay>
  );
};

export default BookmarksOverlayComponent;
