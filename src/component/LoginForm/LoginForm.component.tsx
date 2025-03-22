import Loader from 'Component/Loader';
import ThemedButton from 'Component/ThemedButton';
import ThemedInput from 'Component/ThemedInput';
import ThemedText from 'Component/ThemedText';
import t from 'i18n/t';
import { useRef } from 'react';
import { View } from 'react-native';

import { styles } from './LoginForm.style';
import { LoginFormComponentProps } from './LoginForm.type';

export function LoginFormComponent({
  isLoading,
  login,
}: LoginFormComponentProps) {
  const loginRef = useRef({ username: '', password: '' });

  return (
    <View
      style={ styles.container }
    >
      <ThemedText
        style={ styles.title }
      >
        { t('Please sign in') }
      </ThemedText>
      <ThemedInput
        style={ styles.input }
        placeholder="Username"
        onChangeText={ (text) => { loginRef.current.username = text; } }
      />
      <ThemedInput
        style={ styles.input }
        placeholder="Password"
        onChangeText={ (text) => { loginRef.current.password = text; } }
      />
      <ThemedButton
        style={ styles.button }
        onPress={ () => login(
          loginRef.current.username,
          loginRef.current.password,
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
}

export default LoginFormComponent;
