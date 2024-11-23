import Player from 'Component/Player';
import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { TouchableOpacity, View } from 'react-native';
import { style } from './FilmPage.style.atv';
import { FilmPageComponentProps } from './FilmPage.type';
import { DEMO_VIDEO } from 'Route/PlayerPage/PlayerPage.config';
import { Button, Dialog, Portal, PaperProvider, Text } from 'react-native-paper';
import { useState } from 'react';

export function FilmPageComponent(props: FilmPageComponentProps) {
  const { film, filmVideo, playFilm } = props;
  const [visible, setVisible] = useState(false);

  const showDialog = () => setVisible(true);

  const hideDialog = () => setVisible(false);

  const renderAction = (text: string, onPress?: () => void, isDefault: boolean = false) => {
    return (
      <TouchableOpacity
        hasTVPreferredFocus={isDefault}
        onPress={onPress}
      >
        <ThemedText>{text}</ThemedText>
      </TouchableOpacity>
    );
  };

  const renderActions = () => {
    return (
      <ThemedView>
        {renderAction('Watch Now', playFilm, true)}
        {renderAction('Comments')}
        {renderAction('Bookmark')}
        {renderAction('Trailer')}
        {renderAction('Share')}
        {renderAction('Download')}
      </ThemedView>
    );
  };

  if (!film) {
    return (
      <ThemedView>
        <TouchableOpacity hasTVPreferredFocus>
          <ThemedText>Im a focused button</ThemedText>
        </TouchableOpacity>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (filmVideo) {
    const streams = filmVideo.streams;

    return (
      <View style={style.player}>
        <Player uri={DEMO_VIDEO ?? streams[0].url} />
      </View>
    );
  }

  return (
    <PaperProvider>
      <ThemedView>
        {renderActions()}
        <Button onPress={showDialog}>Show Dialog</Button>
        <ThemedText>Loaded!</ThemedText>
        <ThemedText>title={film.title}</ThemedText>
        <ThemedText>id={film.id}</ThemedText>
        <ThemedImage
          src={film.poster}
          style={{ height: 250, width: 140 }}
        />
        <Portal>
          <Dialog
            visible={visible}
            onDismiss={hideDialog}
          >
            <Dialog.Title>Alert</Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium">This is simple dialog</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideDialog}>Done</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </ThemedView>
    </PaperProvider>
  );
}

export default FilmPageComponent;
