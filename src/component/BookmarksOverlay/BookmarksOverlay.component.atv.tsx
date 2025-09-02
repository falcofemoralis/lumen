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
  onOverlayVisible,
}: BookmarksOverlayComponentProps) => {

  return (
    <ThemedOverlay
      ref={ overlayRef }
      onOpen={ onOverlayVisible }
      onClose={ onClose }
    >
      <Loader
        isLoading={ isLoading }
        fullScreen
      />
      { items.length > 0 && (
        <ThemedMultiList
          header={ t('Bookmarks') }
          data={ items }
          onChange={ postBookmark }
        />
      ) }
    </ThemedOverlay>
  );
};

export default BookmarksOverlayComponent;
