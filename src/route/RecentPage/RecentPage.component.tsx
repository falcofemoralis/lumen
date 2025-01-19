import Page from 'Component/Page';
import ThemedIcon from 'Component/ThemedIcon';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedImage from 'Component/ThemedImage';
import ThemedList from 'Component/ThemedList';
import { ThemedListRowProps } from 'Component/ThemedList/ThemedList.type';
import ThemedText from 'Component/ThemedText';
import React, { memo, useCallback } from 'react';
import {
  Pressable,
  TouchableOpacity,
  View,
} from 'react-native';
import { RecentItemInterface } from 'Type/RecentItem.interface';
import { scale } from 'Util/CreateStyles';

import { NUMBER_OF_COLUMNS } from './RecentPage.config';
import { styles } from './RecentPage.style';
import { RecentGridRowProps, RecentPageComponentProps } from './RecentPage.type';

function FilmGridRow({
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
          <TouchableOpacity onPress={ () => removeItem(item) }>
            <ThemedIcon
              style={ styles.deleteButton }
              icon={ {
                name: 'delete',
                pack: IconPackType.MaterialCommunityIcons,
              } }
              size={ scale(24) }
              color="white"
            />
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
}

function rowPropsAreEqual(prevProps: RecentGridRowProps, props: RecentGridRowProps) {
  return prevProps.item.id === props.item.id;
}

const MemoizedGridRow = memo(FilmGridRow, rowPropsAreEqual);

export function RecentPageComponent({
  isSignedIn,
  items,
  onNextLoad,
  handleOnPress,
  removeItem,
}: RecentPageComponentProps) {
  const renderRow = useCallback(
    ({ item, index }: ThemedListRowProps<RecentItemInterface[]>) => (
      <MemoizedGridRow
        item={ item[0] }
        handleOnPress={ handleOnPress }
        index={ index }
        removeItem={ removeItem }
      />
    ),
    [handleOnPress],
  );

  const renderContent = () => {
    if (!isSignedIn) {
      return (
        <View>
          <ThemedText>Sign in</ThemedText>
        </View>
      );
    }

    return (
      <ThemedList
        data={ items }
        renderItem={ renderRow }
        numberOfColumns={ NUMBER_OF_COLUMNS }
        onNextLoad={ onNextLoad }
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
