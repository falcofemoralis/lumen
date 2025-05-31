import LoginForm from 'Component/LoginForm';
import Page from 'Component/Page';
import ThemedGrid from 'Component/ThemedGrid';
import { ThemedGridRowProps } from 'Component/ThemedGrid/ThemedGrid.type';
import ThemedIcon from 'Component/ThemedIcon';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedImage from 'Component/ThemedImage';
import ThemedPressable from 'Component/ThemedPressable';
import ThemedText from 'Component/ThemedText';
import { Trash2 } from 'lucide-react-native';
import React, { memo, useCallback } from 'react';
import {
  Pressable,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from 'Style/Colors';
import { RecentItemInterface } from 'Type/RecentItem.interface';
import { scale } from 'Util/CreateStyles';

import { NUMBER_OF_COLUMNS } from './RecentPage.config';
import { styles } from './RecentPage.style';
import { RecentPageThumbnail } from './RecentPage.thumbnail';
import { RecentGridRowProps, RecentPageComponentProps } from './RecentPage.type';

function RecentItem({
  item,
  index,
  handleOnPress,
  removeItem,
}: RecentGridRowProps) {
  const {
    image,
    name,
    date,
    info,
    additionalInfo,
  } = item;

  return (
    <Pressable onPress={ () => handleOnPress(item) }>
      <View style={ [styles.item, index !== 0 && styles.itemBorder] }>
        <View style={ styles.itemContainer }>
          <ThemedImage
            style={ styles.poster }
            src={ image }
          />
          <View style={ styles.itemContent }>
            <ThemedText style={ styles.name }>
              { name }
            </ThemedText>
            <ThemedText style={ styles.date }>
              { date }
            </ThemedText>
            { info && (
              <ThemedText style={ styles.info }>
                { info }
              </ThemedText>
            ) }
            { additionalInfo && (
              <ThemedText style={ styles.additionalInfo }>
                { additionalInfo }
              </ThemedText>
            ) }
          </View>
          <ThemedPressable
            onPress={ () => removeItem(item) }
          >
            <Trash2
              style={ styles.deleteButton }
              size={ scale(24) }
              color={ Colors.white }
            />
          </ThemedPressable>
        </View>
      </View>
    </Pressable>
  );
}

function rowPropsAreEqual(prevProps: RecentGridRowProps, props: RecentGridRowProps) {
  return prevProps.item.id === props.item.id;
}

const MemoizedRecentItem = memo(RecentItem, rowPropsAreEqual);

export function RecentPageComponent({
  isSignedIn,
  items,
  onNextLoad,
  handleOnPress,
  removeItem,
}: RecentPageComponentProps) {
  const renderItem = useCallback(
    ({ item, index }: ThemedGridRowProps<RecentItemInterface>) => (
      <MemoizedRecentItem
        item={ item }
        handleOnPress={ handleOnPress }
        index={ index }
        removeItem={ removeItem }
      />
    ),
    [handleOnPress]
  );

  const renderContent = () => {
    if (!isSignedIn) {
      return <LoginForm withRedirect />;
    }

    return (
      <ThemedGrid
        data={ items }
        numberOfColumns={ NUMBER_OF_COLUMNS }
        itemSize={ scale(130) }
        renderItem={ renderItem }
        onNextLoad={ onNextLoad }
        ListEmptyComponent={ <RecentPageThumbnail /> }
      />
    );
  };

  return (
    <Page>
      { renderContent() }
    </Page>
  );
}

export default RecentPageComponent;
