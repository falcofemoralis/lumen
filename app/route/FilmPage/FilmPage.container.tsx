import AppStore from 'Store/App.store';
import FilmPageComponent from './FilmPage.component';
import FilmPageComponentTV from './FilmPage.component.atv';
import { FilmPageContainerProps } from './FilmPage.type';

export function FilmPageContainer(props: FilmPageContainerProps) {
  return AppStore.isTV ? <FilmPageComponentTV /> : <FilmPageComponent />;
}

export default FilmPageContainer;
