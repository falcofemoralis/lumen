import RNRestart from 'react-native-restart';
import ConfigStore from 'Store/Config.store';
import WelcomePageComponent from './WelcomePage.component';

export function WelcomePageContainer() {
  const reloadApp = () => {
    RNRestart.restart();
  };

  const updateConfig = async (isTV: boolean) => {
    await ConfigStore.updateIsTV(isTV);
    await ConfigStore.updateIsConfigured(true);
    reloadApp();
  };

  const handleSelectTV = () => {
    updateConfig(true);
  };

  const handleSelectMobile = () => {
    updateConfig(false);
  };

  const containerFunctions = {
    handleSelectTV,
    handleSelectMobile,
  };

  const containerProps = () => {
    return {};
  };

  return (
    <WelcomePageComponent
      {...containerFunctions}
      {...containerProps()}
    />
  );
}

export default WelcomePageContainer;