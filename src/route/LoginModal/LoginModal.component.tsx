import Header from 'Component/Header';
import LoginForm from 'Component/LoginForm';
import Wrapper from 'Component/Wrapper';
import t from 'i18n/t';
import { View } from 'react-native';

export const LoginModalComponent = () => {
  return (
    <View>
      <Header title={ t('Login') } />
      <Wrapper>
        <LoginForm />
      </Wrapper>
    </View>
  );
};

export default LoginModalComponent;