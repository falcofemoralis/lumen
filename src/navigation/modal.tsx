import CommentsModal from 'Route/CommentsModal';
import ScheduleModal from 'Route/ScheduleModal';
import RouterStore from 'Store/Router.store';
import { FilmInterface } from 'Type/Film.interface';

export default function Modal() {
  const { type, film } = RouterStore.popData('modal') as {
    type: string;
    film: FilmInterface;
  };

  switch (type) {
    case 'comments':
      return <CommentsModal film={ film } />;
    case 'schedule':
      return <ScheduleModal film={ film } />;
    default:
      console.error('Unknown modal type:', type);

      return null;
  }
}
