import { FilmGrid } from 'Component/FilmGrid';
import { Wrapper } from 'Component/Wrapper';

export const BookmarksScreenThumbnail = () => (
  <Wrapper
    style={ {
      width: '100%',
      height: '100%',
    } }
  >
    <FilmGrid films={ [] } />
  </Wrapper>
);
