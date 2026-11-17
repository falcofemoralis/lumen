import { useAppUpdaterContext } from 'Context/AppUpdaterContext';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedText } from 'Component/ThemedText';
import { View } from 'react-native';
import { openLinkInBrowser } from 'Util/Link';
export const AppUpdaterContainer = () => {
  const { update, resetUpdate } = useAppUpdaterContext();
  if (!update) return null;
  return <View style={{ position: 'absolute', bottom: 20, left: 20, right: 20, padding: 20, zIndex: 1000, borderRadius: 12, backgroundColor: '#171717' }}>
    <ThemedText>Доступна Windows-версия Lumen {update.versionName}</ThemedText>
    <ThemedButton title="Открыть загрузку" onPress={() => openLinkInBrowser(update.downloadAndroidUrl)} />
    <ThemedButton title="Позже" onPress={resetUpdate} />
  </View>;
};
export default AppUpdaterContainer;
