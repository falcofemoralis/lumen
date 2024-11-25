import ThemedText from 'Component/ThemedText';
import { Modal, Portal } from 'react-native-paper';
import { styles } from './FilmVideoSelector.style.atv';
import { FilmVideoSelectorComponentProps } from './FilmVideoSelector.type';
import { TouchableOpacity, TVFocusGuideView } from 'react-native';

export function FilmVideoSelectorComponent(props: FilmVideoSelectorComponentProps) {
  const { visible, onHide } = props;

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onHide}
        contentContainerStyle={styles.container}
      >
        <TVFocusGuideView
          autoFocus
          trapFocusLeft
          trapFocusRight
          trapFocusUp
          trapFocusDown
        >
          <ThemedText>Example Modal. Click outside this area to dismiss.</ThemedText>
          <TouchableOpacity hasTVPreferredFocus>
            <ThemedText>Oopen</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity>
            <ThemedText>qwewqe</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity>
            <ThemedText>qweqwe</ThemedText>
          </TouchableOpacity>
        </TVFocusGuideView>
      </Modal>
    </Portal>
  );
}

export default FilmVideoSelectorComponent;
