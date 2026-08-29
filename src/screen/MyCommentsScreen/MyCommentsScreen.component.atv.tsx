import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation-react-native-tvos';
import { ConfirmOverlay } from 'Component/ConfirmOverlay';
import { InfoBlock } from 'Component/InfoBlock';
import { Page } from 'Component/Page';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedGrid } from 'Component/ThemedGrid';
import { ThemedGridRowProps } from 'Component/ThemedGrid/ThemedGrid.type';
import { ThemedImage } from 'Component/ThemedImage';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import Trash2 from 'lucide-react-native/icons/trash-2';
import { useCallback } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useAppTheme } from 'Theme/context';
import { ThemedStyles } from 'Theme/types';

import {
  NUMBER_OF_COLUMNS_TV,
  TEXT_MAX_LINES_TV,
  TITLE_MAX_LINES,
} from './MyCommentsScreen.config';
import { componentStyles } from './MyCommentsScreen.style.atv';
import { CommentSegmentsText } from './MyCommentsScreen.text';
import {
  MyCommentItem,
  MyCommentRowProps,
  MyCommentsScreenComponentProps,
} from './MyCommentsScreen.type';

const ACTION_ICON_SIZE = 20;

// The zoom is applied to the row -- not to the item -- so it also covers the
// gap and grows the row as one block. `hasFocusedChild` keeps it applied while
// focus moves between the item and the forget button, and the button
// counter-scales so it keeps its fixed square size.
function MyCommentRow({
  item,
  isLastRow,
  styles,
  handleOnPress,
  openForgetConfirmOverlay,
}: Omit<MyCommentRowProps, 'index'> & {
  isLastRow: boolean;
  styles: ThemedStyles<typeof componentStyles>;
}) {
  const { ref, focusKey, hasFocusedChild } = useFocusable<object, View>({
    trackChildren: true,
    saveLastFocusedChild: false,
  });
  const { scale } = useAppTheme();

  const {
    poster,
    title,
    date,
    segments,
    replyToUsername,
  } = item;

  return (
    <FocusContext.Provider value={ focusKey }>
      <Animated.View
        ref={ ref }
        style={ [styles.row, isLastRow && styles.lastRow, hasFocusedChild && styles.rowFocused] }
        tvFocusable={ false }
      >
        <ThemedPressable
          style={ styles.fill }
          contentStyle={ styles.fill }
          onPress={ () => handleOnPress(item) }
        >
          { ({ isFocused }) => {
            return (
              <Animated.View
                style={ [
                  styles.fill,
                  styles.item,
                  isFocused && styles.itemFocused,
                ] }
              >
                <View style={ [styles.poster, styles.posterContainer, isFocused && styles.posterContainerFocused] }>
                  <ThemedImage
                    style={ styles.poster }
                    src={ poster }
                  />
                </View>
                { /* The row is a fixed height and its content is centred, so
                     text that wraps past it is clipped at both ends rather than
                     pushing the row taller -- every line count is capped. */ }
                <View style={ styles.itemContent }>
                  <ThemedText
                    style={ styles.title }
                    numberOfLines={ TITLE_MAX_LINES }
                  >
                    { title }
                  </ThemedText>
                  <ThemedText
                    style={ styles.date }
                    numberOfLines={ 1 }
                  >
                    { date }
                  </ThemedText>
                  { replyToUsername && (
                    <ThemedText
                      style={ styles.replyTo }
                      numberOfLines={ 1 }
                    >
                      { t('Reply to {{username}}', { username: replyToUsername }) }
                    </ThemedText>
                  ) }
                  <CommentSegmentsText
                    segments={ segments }
                    style={ styles.text }
                    numberOfLines={ TEXT_MAX_LINES_TV }
                  />
                </View>
              </Animated.View>
            );
          } }
        </ThemedPressable>
        <ThemedButton
          style={ [styles.actionButton, hasFocusedChild && styles.actionButtonUnzoomed] }
          contentStyle={ styles.actionButtonContent }
          IconComponent={ Trash2 }
          onPress={ () => openForgetConfirmOverlay(item) }
          iconProps={ {
            size: scale(ACTION_ICON_SIZE),
          } }
        />
      </Animated.View>
    </FocusContext.Provider>
  );
}

export function MyCommentsScreenComponent({
  items,
  forgetConfirmOverlayRef,
  handleOnPress,
  openForgetConfirmOverlay,
  forgetComment,
}: MyCommentsScreenComponentProps) {
  const styles = useThemedStyles(componentStyles);

  const renderItem = useCallback(({ item, index }: ThemedGridRowProps<MyCommentItem>) => (
    <MyCommentRow
      item={ item }
      isLastRow={ index === items.length - 1 }
      styles={ styles }
      handleOnPress={ handleOnPress }
      openForgetConfirmOverlay={ openForgetConfirmOverlay }
    />
  ), [styles, items.length, handleOnPress, openForgetConfirmOverlay]);

  const renderContent = () => {
    if (!items.length) {
      return (
        <View style={ styles.empty }>
          <InfoBlock
            title={ t('No comments yet') }
            subtitle={ t('Comments you post are saved here on this device') }
          />
        </View>
      );
    }

    return (
      <ThemedGrid
        autofocus
        style={ styles.grid }
        rowStyle={ styles.rowStyle }
        data={ items }
        numberOfColumns={ NUMBER_OF_COLUMNS_TV }
        renderItem={ renderItem }
        scrollBehavior='stick-to-center'
      />
    );
  };

  const renderConfirmOverlay = () => {
    return (
      <ConfirmOverlay
        overlayRef={ forgetConfirmOverlayRef }
        title={ t('Are you sure?') }
        message={ t('The comment stays on the site, only this device forgets it.') }
        confirmButtonText={ t('Forget') }
        onConfirm={ forgetComment }
      />
    );
  };

  return (
    <Page checkConnection={ false }>
      { renderConfirmOverlay() }
      { renderContent() }
    </Page>
  );
}

export default MyCommentsScreenComponent;
