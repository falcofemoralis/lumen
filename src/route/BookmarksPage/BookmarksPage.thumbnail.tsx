import { FilmGridThumbnail } from 'Component/FilmGrid/FilmGrid.thumbnail';
import Wrapper from 'Component/Wrapper';

export const BookmarksPageThumbnail = () => (
  <Wrapper
    style={ {
      width: '100%',
      height: '100%',
    } }
  >
    <FilmGridThumbnail />
  </Wrapper>
);
