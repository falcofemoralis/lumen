import Comments from 'Component/Comments';
import Header from 'Component/Header';
import Wrapper from 'Component/Wrapper';
import t from 'i18n/t';
import { View } from 'react-native';

import { CommentsModalProps } from './CommentsModal.type';

export const CommentsModalComponent = ({ film }: CommentsModalProps) => {
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