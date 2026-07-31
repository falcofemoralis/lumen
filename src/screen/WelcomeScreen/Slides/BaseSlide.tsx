import { KeyboardAdjuster } from 'Component/KeyboardAdjuster';
import { ThemedGroup } from 'Component/ThemedGroup';
import { ThemedImage } from 'Component/ThemedImage';
import { Portal } from 'Component/ThemedPortal';
import { ThemedText } from 'Component/ThemedText';
import { useOverlayContext } from 'Context/OverlayContext';
import { useLandscape } from 'Hooks/useLandscape';
import { t } from 'i18n/translate';
import { ChevronLeft } from 'lucide-react-native';
import {
  ComponentType,
  ReactNode,
} from 'react';
import {
  Image,
  ImageSourcePropType,
  ScrollView,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import { useAppTheme } from 'Theme/context';
import { ThemedStyles } from 'Theme/types';

import { SlidePressable } from '../Elements/SlidePressable';
import { componentStyles } from '../WelcomeScreen.style';

export interface BaseSlideProps {
  title: string;
  subtitle: string;
  IconComponent: ComponentType<any>,
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  customImage?: string;
  customTitle?: string;
  customSubtitle?: string;
  image?: ImageSourcePropType;
  styles: ThemedStyles<typeof componentStyles>;
  nextButtonTitle?: string;
  goBack?: () => void;
  goNext?: () => void;
  complete?: () => void;
}

export const BaseSlide = ({
  title,
  subtitle,
  children,
  style,
  customImage,
  customTitle,
  customSubtitle,
  IconComponent,
  image,
  nextButtonTitle,
  goBack,
  goNext,
  styles,
}: BaseSlideProps) => {
  const isLandscape = useLandscape();
  const { theme, scale } = useAppTheme();
  const { isOverlayOpen } = useOverlayContext();

  const renderContent = () => {
    return (
      <View
        style={ [
          styles.info,
          isLandscape && styles.infoLandscape,
        ] }
      >
        { image && (
          <Image
            source={ image }
            style={ styles.image }
          />
        ) }
        { customImage && (
          <ThemedImage
            src={ customImage }
            style={ styles.customImage }
          />
        ) }
        { IconComponent && !customImage && !image && (
          <View style={ styles.iconContainer }>
            <IconComponent
              size={ scale(28) }
              color={ theme.colors.icon }
            />
          </View>
        ) }
        <ThemedText style={ styles.title }>
          { customTitle ?? title }
        </ThemedText>
        <ThemedText style={ styles.subtitle }>
          { customSubtitle ?? subtitle }
        </ThemedText>
      </View>
    );
  };

  const renderBaseNavigation = () => {
    return (
      <ThemedGroup style={ styles.navigation }>
        { goBack && (
          <View style={ styles.prevButtonContainer }>
            <SlidePressable
              style={ styles.prevButton }
              contentStyle={ styles.prevButtonContent }
              onPress={ goBack }
              styles={ styles }
            >
              { ({ isFocused }) => (
                <ChevronLeft
                  size={ scale(24) }
                  color={ isFocused ? theme.colors.iconFocused : theme.colors.icon }
                />
              ) }
            </SlidePressable>
          </View>
        ) }
        <SlidePressable
          autofocus
          style={ styles.nextButton }
          contentStyle={ styles.nextButtonContent }
          onPress={ goNext }
          styles={ styles }
        >
          { ({ isFocused }) => (
            <ThemedText
              style={ [
                styles.buttonText,
                isFocused && styles.TVfocusedText,
              ] }
            >
              { nextButtonTitle ?? t('Next') }
            </ThemedText>
          ) }
        </SlidePressable>
      </ThemedGroup>
    );
  };

  return (
    <Portal.Host>
      <ScrollView
        contentContainerStyle={ [
          styles.container,
          isLandscape && styles.containerLandscape,
          style,
        ] }
      >
        { renderContent() }
        { children }
        <KeyboardAdjuster isActive={ !isOverlayOpen } />
        { renderBaseNavigation() }
      </ScrollView>
    </Portal.Host>
  );
};