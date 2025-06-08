import Comments from 'Component/Comments';
import Header from 'Component/Header';
import Wrapper from 'Component/Wrapper';
import t from 'i18n/t';
import { ScrollView, View } from 'react-native';

import { CommentsModalProps } from './CommentsModal.type';

export const CommentsModalComponent = ({ film }: CommentsModalProps) => {
  return (
    <View>
      <Header title={ t('Comments') } />
      <Wrapper>
        <ScrollView
          horizontal
          contentContainerStyle={ { width: '100%', height: '100%' } }
        >
          <Comments
            film={ film }
          />
        </ScrollView>
      </Wrapper>
    </View>
  );
};

export default CommentsModalComponent;