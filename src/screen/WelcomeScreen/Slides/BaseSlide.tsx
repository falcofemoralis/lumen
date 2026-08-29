import { KeyboardAdjuster } from 'Component/KeyboardAdjuster';
import { ThemedGroup } from 'Component/ThemedGroup';
import { ThemedImage } from 'Component/ThemedImage';
import { ThemedText } from 'Component/ThemedText';
import { useOverlayContext } from 'Context/OverlayContext';
import { useLandscape } from 'Hooks/useLandscape';
import { t } from 'i18n/translate';
import ChevronLeft from 'lucide-react-native/icons/chevron-left';
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

export const BACK_BUTTON_FOCUS_KEY = 'BACK_BUTTON';
export const NEXT_BUTTON_FOCUS_KEY = 'NEXT_BUTTON';

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
              focusKey={ BACK_BUTTON_FOCUS_KEY }
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
          focusKey={ NEXT_BUTTON_FOCUS_KEY }
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

  // The portal host lives at the screen root, outside the Wrapper: a host
  // mounted here would give the overlay an absolute fill the size of the
  // wrapper's box, leaving its horizontal margins undimmed.
  return (
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
  );
};