import Comments from 'Component/Comments';
import Wrapper from 'Component/Wrapper';
import { useNavigation } from 'expo-router';
import t from 'i18n/t';
import { useEffect } from 'react';
import { ScrollView, View } from 'react-native';

import { CommentsModalProps } from './CommentsModal.type';

export const CommentsModalComponent = ({ film }: CommentsModalProps) => {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: t('Comments'),
    });
  }, [navigation]);

  return (
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
  );
};

export default CommentsModalComponent;