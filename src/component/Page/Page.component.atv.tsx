import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation-react-native-tvos';
import { InfoBlock } from 'Component/InfoBlock';
import { ThemedButton } from 'Component/ThemedButton';
import { Portal } from 'Component/ThemedPortal';
import { useIsScreenFocused } from 'Hooks/useIsScreenFocused';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { GlobeX } from 'lucide-react-native';
import { View } from 'react-native';
import { restartApp } from 'Util/Device';

import { componentStyles } from './Page.style.atv';
import { PageComponentProps } from './Page.type';

export function PageComponent({
  children,
  style,
  isConnected,
  fullscreen,
}: PageComponentProps) {
  const styles = useThemedStyles(componentStyles);
  const isScreenFocused = useIsScreenFocused();

  /**
   * A screen stays mounted while another one covers it -- a pushed film view, or
   * simply another tab -- and every focusable it rendered stays registered with
   * norigin, parented to SN:ROOT. Spatial navigation then treats the hidden
   * screen as a sibling of the visible one: leaving the sidebar to the right
   * lands on the home grid behind the film view, which is invisible but takes
   * every D-Pad press from there on.
   *
   * Making the page container the focus parent of its screen, and marking it
   * non-focusable while the screen is not the focused route, drops that whole
   * subtree out of the sibling search without unmounting anything (norigin
   * filters siblings by `focusable`). Focus can only enter the screen that is
   * actually on top, and it re-enters through this container, so norigin's
   * lastFocusedChild puts the user back where they were.
   */
  const { ref, focusKey } = useFocusable<object, View>({
    focusable: isScreenFocused,
  });

  const renderContent = () => {
    if (!isConnected) {
      return (
        <View style={ styles.noConnectionContainer }>
          <InfoBlock
            title={ t('Network error') }
            subtitle={ t('Network request failed. Please check your internet connection and try again.') }
            Icon={ GlobeX }
          />
          <ThemedButton
            title={ t('Retry') }
            style={ styles.button }
            onPress={ restartApp }
            autofocus
          />
        </View>
      );
    }

    return children;
  };

  return (
    // The portal host stays OUTSIDE the focus context on purpose: overlays
    // portaled into it must keep SN:ROOT as their focus parent, so they own focus
    // as a focus boundary of their own instead of hanging off the page.
    <Portal.Host>
      <FocusContext.Provider value={ focusKey }>
        <View
          ref={ ref }
          style={ [styles.container, fullscreen && styles.fullscreen, style] }
        >
          { renderContent() }
        </View>
      </FocusContext.Provider>
    </Portal.Host>
  );
}

export default PageComponent;
