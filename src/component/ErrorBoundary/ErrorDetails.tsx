import { ThemedButton } from 'Component/ThemedButton';
import { ThemedSafeArea } from 'Component/ThemedSafeArea';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { ScrollView, View } from 'react-native';
import { DefaultFocus, SpatialNavigationRoot } from 'react-tv-space-navigation';

import { componentStyles } from './ErrorBoundary.style';
import { ErrorDetailsProps } from './ErrorBoundary.type';

/**
 * Renders the error details screen.
 * @param {ErrorDetailsProps} props - The props for the `ErrorDetails` component.
 * @returns {JSX.Element} The rendered `ErrorDetails` component.
 */
export function ErrorDetails({
  error,
  errorInfo,
  onReset,
}: ErrorDetailsProps) {
  const styles = useThemedStyles(componentStyles);

  return (
    <SpatialNavigationRoot>
      <ThemedSafeArea style={ styles.container }>
        <View style={ styles.content }>
          <ThemedText style={ styles.title }>
            { t('Oops!') }
          </ThemedText>
          <ThemedText style={ styles.subtitle }>
            { t('Something went wrong') }
          </ThemedText>
          <ThemedText style={ styles.error }>
            { error.toString().trim() }
          </ThemedText>
          <ScrollView
            style={ styles.scroll }
            contentContainerStyle={ styles.scrollContent }
          >
            { errorInfo && (
              <ThemedText
                selectable
                style={ styles.errorBacktrace }
              >
                { (errorInfo?.componentStack ?? '').trim() }
              </ThemedText>
            ) }
          </ScrollView>
          <DefaultFocus>
            <ThemedButton style={ styles.button } onPress={ onReset }>
              { t('Try again') }
            </ThemedButton>
          </DefaultFocus>
        </View>
      </ThemedSafeArea>
    </SpatialNavigationRoot>
  );
}
