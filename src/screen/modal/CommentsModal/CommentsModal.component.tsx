import { Comments } from 'Component/Comments';
import { Header } from 'Component/Header';
import { ThemedSafeArea } from 'Component/ThemedSafeArea';
import { Wrapper } from 'Component/Wrapper';
import { t } from 'i18n/translate';
import { COMMENTS_MODAL_SCREEN } from 'Navigation/navigationRoutes';
import { View } from 'react-native';
import RouterStore from 'Store/Router.store';
import { FilmInterface } from 'Type/Film.interface';

import { CommentsModalProps } from './CommentsModal.type';

export const CommentsModal = () => {
  const { film } = RouterStore.popData(COMMENTS_MODAL_SCREEN) as {
    film: FilmInterface;
  } ?? {};

  return <CommentsModalComponent film={ film } />;
};

export const CommentsModalComponent = ({ film }: CommentsModalProps) => {
  return (
    <ThemedSafeArea edges={ ['top', 'bottom', 'left', 'right'] }>
      <View style={ { flex: 1 } }>
        <Header title={ t('Comments') } />
        <Wrapper style={ { flex: 1 } }>
          <Comments
            film={ film }
            initialLoad
          />
        </Wrapper>
      </View>
    </ThemedSafeArea>
  );
};

export default CommentsModal;