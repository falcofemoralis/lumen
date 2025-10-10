import ThemedButton from 'Component/ThemedButton';
import ThemedSafeArea from 'Component/ThemedSafeArea';
import ThemedText from 'Component/ThemedText';
import t from 'i18n/t';
import React from 'react';
import { View } from 'react-native';
import { DefaultFocus, SpatialNavigationRoot } from 'react-tv-space-navigation';

import { styles } from './FallbackComponent.style';

export type Props = { error: Error; resetError: () => void }

const FallbackComponent = ({
  error,
  resetError,
}: Props) => (
  <SpatialNavigationRoot>
    <ThemedSafeArea style={ styles.container }>
      <View style={ styles.content }>
        <ThemedText style={ styles.title }>{ t('Oops!') }</ThemedText>
        <ThemedText style={ styles.subtitle }>{ t('Theres an error') }</ThemedText>
        <ThemedText style={ styles.error }>{ error.toString() }</ThemedText>
        <DefaultFocus>
          <ThemedButton style={ styles.button } onPress={ resetError }>
            { t('Try again') }
          </ThemedButton>
        </DefaultFocus>
      </View>
    </ThemedSafeArea>
  </SpatialNavigationRoot>
);

export default FallbackComponent;
