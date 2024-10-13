import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import React, { useState } from 'react';
import { TouchableOpacity, TVFocusGuideView, useTVEventHandler } from 'react-native';
import { scale } from 'Util/CreateStyles';
import { styles } from './NavigationBar.style';

export function NavigationBarComponent() {
  const [isFocused, setIsFocused] = useState(false);

  const myTVEventHandler = (evt: any) => {
    if (evt.eventType === 'right' && isFocused) {
      setIsFocused(false);
    }
  };

  useTVEventHandler(myTVEventHandler);

  const onFocus = () => {
    if (!isFocused) {
      setIsFocused(true);
    }
  };

  const renderTVBar = () => {
    return (
      <ThemedView style={{ ...styles.container, width: isFocused ? scale(120) : scale(80) }}>
        <ThemedView style={styles.tab}>
          <TVFocusGuideView autoFocus>
            <TouchableOpacity onFocus={onFocus}>
              <ThemedText style={styles.tabText}>Home rel</ThemedText>
            </TouchableOpacity>
          </TVFocusGuideView>
          <TouchableOpacity onFocus={onFocus}>
            <ThemedText style={styles.tabText}>Film</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity onFocus={onFocus}>
            <ThemedText style={styles.tabText}>qwe</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity onFocus={onFocus}>
            <ThemedText style={styles.tabText}>ewe</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity onFocus={onFocus}>
            <ThemedText style={styles.tabText}>wrwr</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity onFocus={onFocus}>
            <ThemedText style={styles.tabText}>wqe</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    );
  };

  return renderTVBar();
}

export default NavigationBarComponent;
