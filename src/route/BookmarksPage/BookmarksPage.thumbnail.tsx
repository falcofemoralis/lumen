import { FilmGridThumbnail } from 'Component/FilmGrid/FilmGrid.thumbnail';
import Wrapper from 'Component/Wrapper';

export const BookmarksPageThumbnail = ({ top }: { top: number }) => (
  <Wrapper
    style={ {
      width: '100%',
      height: '100%',
      paddingTop: top,
    } }
  >
    <FilmGridThumbnail />
  </Wrapper>
);
