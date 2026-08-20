import { ConfirmOverlay } from 'Component/ConfirmOverlay';
import { InfoBlock } from 'Component/InfoBlock';
import { Page } from 'Component/Page';
import { ThemedGrid } from 'Component/ThemedGrid';
import { ThemedGridRowProps } from 'Component/ThemedGrid/ThemedGrid.type';
import { ThemedImage } from 'Component/ThemedImage';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import Trash2 from 'lucide-react-native/icons/trash-2';
import { memo, useCallback } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from 'Theme/context';
import { ThemedStyles } from 'Theme/types';

import { NUMBER_OF_COLUMNS, TEXT_MAX_LINES, TITLE_MAX_LINES } from './MyCommentsScreen.config';
import { componentStyles } from './MyCommentsScreen.style';
import { CommentSegmentsText } from './MyCommentsScreen.text';
import {
  MyCommentItem,
  MyCommentRowProps,
  MyCommentsScreenComponentProps,
} from './MyCommentsScreen.type';

function MyCommentRow({
  item,
  index,
  styles,
  handleOnPress,
  openForgetConfirmOverlay,
}: MyCommentRowProps & { styles: ThemedStyles<typeof componentStyles> }) {
  const {
    poster,
    title,
    date,
    segments,
    replyToUsername,
  } = item;
  const { scale, theme } = useAppTheme();

  return (
    <ThemedPressable
      onPress={ () => handleOnPress(item) }
      contentStyle={ styles.itemContentWrapper }
    >
      <View style={ [styles.item, index !== 0 && styles.itemBorder] }>
        <View style={ styles.itemContainer }>
          <ThemedImage
            style={ styles.poster }
            src={ poster }
          />
          <View style={ styles.itemContent }>
            <ThemedText
              style={ styles.title }
              numberOfLines={ TITLE_MAX_LINES }
            >
              { title }
            </ThemedText>
            <ThemedText style={ styles.date }>
              { date }
            </ThemedText>
            { replyToUsername && (
              <ThemedText style={ styles.replyTo }>
                { t('Reply to {{username}}', { username: replyToUsername }) }
              </ThemedText>
            ) }
            <CommentSegmentsText
              segments={ segments }
              style={ styles.text }
              numberOfLines={ TEXT_MAX_LINES }
            />
          </View>
          <ThemedPressable
            onPress={ () => openForgetConfirmOverlay(item) }
            style={ styles.forgetButton }
          >
            <Trash2
              size={ scale(24) }
              color={ theme.colors.icon }
            />
          </ThemedPressable>
        </View>
      </View>
    </ThemedPressable>
  );
}

function rowPropsAreEqual(prevProps: MyCommentRowProps, props: MyCommentRowProps) {
  return prevProps.item.id === props.item.id && prevProps.index === props.index;
}

const MemoizedMyCommentRow = memo(MyCommentRow, rowPropsAreEqual);

export function MyCommentsScreenComponent({
  items,
  forgetConfirmOverlayRef,
  handleOnPress,
  openForgetConfirmOverlay,
  forgetComment,
}: MyCommentsScreenComponentProps) {
  const styles = useThemedStyles(componentStyles);
  const { top } = useSafeAreaInsets();

  const renderItem = useCallback(
    ({ item, index }: ThemedGridRowProps<MyCommentItem>) => (
      <MemoizedMyCommentRow
        item={ item }
        index={ index }
        styles={ styles }
        handleOnPress={ handleOnPress }
        openForgetConfirmOverlay={ openForgetConfirmOverlay }
      />
    ),
    [styles, handleOnPress, openForgetConfirmOverlay]
  );

  const renderHeader = useCallback(() => {
    return <View style={ { height: top } } />;
  }, [top]);

  const renderEmpty = () => {
    return (
      <View style={ styles.empty }>
        <InfoBlock
          title={ t('No comments yet') }
          subtitle={ t('Comments you post are saved here on this device') }
        />
      </View>
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
      <ThemedGrid
        data={ items }
        numberOfColumns={ NUMBER_OF_COLUMNS }
        renderItem={ renderItem }
        ListHeaderComponent={ renderHeader }
        ListEmptyComponent={ renderEmpty }
        disableRefresh
      />
    </Page>
  );
}

export default MyCommentsScreenComponent;
