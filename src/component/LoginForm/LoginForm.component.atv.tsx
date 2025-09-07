import { useNavigation } from '@react-navigation/native';
import InfoBlock from 'Component/InfoBlock';
import Loader from 'Component/Loader';
import ThemedButton from 'Component/ThemedButton';
import ThemedInput from 'Component/ThemedInput';
import t from 'i18n/t';
import { useRef } from 'react';
import { View } from 'react-native';
import { AvoidSoftInputView } from 'react-native-avoid-softinput';
import { DefaultFocus } from 'react-tv-space-navigation';
import { ACCOUNT_ROUTE } from 'Route/AccountPage/AccountPage.config';

import { styles } from './LoginForm.style.atv';
import { LoginFormComponentProps } from './LoginForm.type';

export function LoginFormComponent({
  isLoading,
  withRedirect,
  handleLogin,
}: LoginFormComponentProps) {
  const navigation = useNavigation();
  const loginRef = useRef({ username: '', password: '' });

  const renderForm = () => {
    if (withRedirect) {
      return (
        <ThemedButton
          style={ styles.form }
          onPress={ () => navigation.navigate(ACCOUNT_ROUTE) }
        >
          { t('Go to login page') }
        </ThemedButton>
      );
    }

    return (
      <View style={ styles.form }>
        <View style={ styles.inputContainer }>
          <ThemedInput
            style={ styles.input }
            placeholder={ t('Login or email') }
            onChangeText={ (text) => { loginRef.current.username = text; } }
          />
        </View>
        <View style={ styles.inputContainer }>
          <ThemedInput
            style={ styles.input }
            placeholder={ t('Password') }
            onChangeText={ (text) => { loginRef.current.password = text; } }
            secureTextEntry
          />
        </View>
        <ThemedButton
          style={ styles.button }
          onPress={ () => handleLogin(
            loginRef.current.username,
            loginRef.current.password
          ) }
        >
          { t('Sign in') }
        </ThemedButton>
        <Loader
          isLoading={ isLoading }
          fullScreen
        />
      </View>
    );
  };

  return (
    <DefaultFocus>
      <AvoidSoftInputView>
        <View
          style={ styles.container }
        >
          <InfoBlock
            title={ t('You are not logged in') }
            subtitle={ t('Sign in to sync content') }
          />
          { renderForm() }
        </View>
      </AvoidSoftInputView>
    </DefaultFocus>
  );
}

export default LoginFormComponent;
