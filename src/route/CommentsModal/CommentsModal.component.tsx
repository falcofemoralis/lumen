import Comments from 'Component/Comments';
import Header from 'Component/Header';
import Wrapper from 'Component/Wrapper';
import t from 'i18n/t';
import { View } from 'react-native';
import RouterStore from 'Store/Router.store';
import { FilmInterface } from 'Type/Film.interface';

import { COMMENTS_MODAL_ROUTE } from './CommentsModal.config';

export const CommentsModalComponent = () => {
  const { film } = RouterStore.popData(COMMENTS_MODAL_ROUTE) as {
    film: FilmInterface;
  } ?? {};

  return (
    <View style={ { flex: 1 } }>
      <Header title={ t('Comments') } />
      <Wrapper style={ { flex: 1 } }>
        <Comments
          film={ film }
          initialLoad
        />
      </Wrapper>
    </View>
  );
};

export default CommentsModalComponent;