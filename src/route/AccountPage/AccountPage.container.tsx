import { withTV } from 'Hooks/withTV';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import ServiceStore from 'Store/Service.store';
import { ProfileInterface } from 'Type/Profile.interface';

import AccountPageComponent from './AccountPage.component';
import AccountPageComponentTV from './AccountPage.component.atv';

export function AccountPageContainer() {
  const [isSignedIn, setIsSignedIn] = useState(ServiceStore.isSignedIn);
  const [profile, setProfile] = useState<ProfileInterface | null>(ServiceStore.getProfile());

  useEffect(() => {
    if (!profile) {
      setProfile(ServiceStore.getProfile());
    }

    if (ServiceStore.isSignedIn !== isSignedIn) {
      setIsSignedIn(ServiceStore.isSignedIn);
    }
  }, [ServiceStore.isSignedIn]);

  const containerFunctions = {
  };

  const containerProps = () => ({
    isSignedIn,
    profile,
  });

  return withTV(AccountPageComponentTV, AccountPageComponent, {
    ...containerFunctions,
    ...containerProps(),
  });
}

export default observer(AccountPageContainer);
