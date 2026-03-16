import { InfoBlock } from 'Component/InfoBlock';
import { ThemedButton } from 'Component/ThemedButton';
import { Portal } from 'Component/ThemedPortal';
import { Wrapper } from 'Component/Wrapper';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { GlobeX } from 'lucide-react-native';
import { View } from 'react-native';
import { restartApp } from 'Util/Device';

import { componentStyles } from './Page.style';
import { PageComponentProps } from './Page.type';

export function PageComponent({
  children,
  style,
  isConnected,
}: PageComponentProps) {
  const styles = useThemedStyles(componentStyles);

  if (!isConnected) {
    return (
      <View
        style={ [
          styles.container,
          styles.noConnectionContainer,
          style,
        ] }
      >
        <Wrapper>
          <InfoBlock
            title={ t('Network error') }
            subtitle={ t('Network request failed. Please check your internet connection and try again.') }
            Icon={ GlobeX }
          />
          <ThemedButton style={ styles.btn } onPress={ restartApp }>
            { t('Retry') }
          </ThemedButton>
        </Wrapper>
      </View>
    );
  }

  return (
    <Portal.Host>
      <View
        style={ [
          styles.container,
          style,
        ] }
      >
        { children }
      </View>
    </Portal.Host>
  );
}

export default PageComponent;
