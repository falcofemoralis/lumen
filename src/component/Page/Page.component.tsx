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

  const renderContent = () => {
    if (!isConnected) {
      return (
        <Wrapper style={ styles.noConnectionContainer }>
          <InfoBlock
            title={ t('Network error') }
            subtitle={ t('Network request failed. Please check your internet connection and try again.') }
            Icon={ GlobeX }
          />
          <ThemedButton
            title={ t('Retry') }
            style={ styles.button }
            onPress={ restartApp }
          />
        </Wrapper>
      );
    }

    return children;
  };

  return (
    <Portal.Host>
      <View style={ [ styles.container, style ] }>
        { renderContent() }
      </View>
    </Portal.Host>
  );
}

export default PageComponent;
