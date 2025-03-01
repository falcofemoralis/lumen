import Loader from 'Component/Loader';
import ThemedMultiList from 'Component/ThemedMultiList';
import ThemedOverlay from 'Component/ThemedOverlay';
import __ from 'i18n/__';
import OverlayStore from 'Store/Overlay.store';

import { BookmarksSelectorComponentProps } from './BookmarksSelector.type';

export const BookmarksSelectorComponent = ({
  overlayId,
  data,
  isLoading,
  postBookmark,
}: BookmarksSelectorComponentProps) => (
  <ThemedOverlay
    id={ overlayId }
    onHide={ () => OverlayStore.goToPreviousOverlay() }
  >
    <Loader
      isLoading={ isLoading }
      fullScreen
    />
    <ThemedMultiList
      header={ __('Bookmarks') }
      data={ data }
      onChange={ postBookmark }
    />
  </ThemedOverlay>
);

export default BookmarksSelectorComponent;
