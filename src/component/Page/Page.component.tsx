import { InfoBlock } from 'Component/InfoBlock';
import { ThemedButton } from 'Component/ThemedButton';
import { Wrapper } from 'Component/Wrapper';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import GlobeX from 'lucide-react-native/icons/globe-x';
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

  // No portal host here on purpose: the only thing portaled on mobile is
  // ThemedOverlay, and a host on the page would clip it to the scene -- the tab
  // bar is a sibling below the scene, so the backdrop would neither dim it nor
  // block taps on it. Falling through to the app-wide host in Root covers the
  // whole window, the way the native Modal used to.
  return (
    <View style={ [ styles.container, style ] }>
      { renderContent() }
    </View>
  );
}

export default PageComponent;
