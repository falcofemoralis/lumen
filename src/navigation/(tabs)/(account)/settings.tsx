import React, { useEffect, useState } from 'react';
import SettingsPage from 'Route/SettingsPage';
import ConfigStore from 'Store/Config.store';

export function SettingsScreen() {
  const [rendered, setRendered] = useState(ConfigStore.isTV());

  useEffect(() => {
    if (!ConfigStore.isTV()) {
      // prevents lagging when rendering
      setTimeout(() => {
        setRendered(true);
      }, 100);
    }
  }, []);

  if (!rendered) {
    return null;
  }

  return <SettingsPage />;
}

export default SettingsScreen;
