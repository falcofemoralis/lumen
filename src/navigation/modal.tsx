import { SafeAreaView } from 'react-native-safe-area-context';
import CommentsModal from 'Route/CommentsModal';
import LoginModal from 'Route/LoginModal';
import ScheduleModal from 'Route/ScheduleModal';
import RouterStore from 'Store/Router.store';
import { Colors } from 'Style/Colors';
import { FilmInterface } from 'Type/Film.interface';

export default function Modal() {
  const { type, film, additionalProps } = RouterStore.popData('modal') as {
    type: string;
    film: FilmInterface;
    additionalProps: Record<string, any>;
  } ?? {};

  if (!type) {
    return null;
  }

  const renderContent = () => {
    switch (type) {
      case 'comments':
        return <CommentsModal film={ film } />;
      case 'schedule':
        const { handleUpdateScheduleWatch } = additionalProps;

        return <ScheduleModal film={ film } handleUpdateScheduleWatch={ handleUpdateScheduleWatch } />;
      case 'login':
        return <LoginModal />;
      default:
        console.error('Unknown modal type:', type);

        throw new Error(`Unknown modal type: ${ type }`);
    }
  };

  return (
    <SafeAreaView style={ { flex: 1, backgroundColor: Colors.background } }>
      { renderContent() }
    </SafeAreaView>
  );
}
