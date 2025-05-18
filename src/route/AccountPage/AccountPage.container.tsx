import { useServiceContext } from 'Context/ServiceContext';
import { withTV } from 'Hooks/withTV';

import AccountPageComponent from './AccountPage.component';
import AccountPageComponentTV from './AccountPage.component.atv';

export function AccountPageContainer() {
  const { isSignedIn, profile } = useServiceContext();

  const containerProps = () => ({
    isSignedIn,
    profile,
  });

  return withTV(AccountPageComponentTV, AccountPageComponent, {
    ...containerProps(),
  });
}

export default AccountPageContainer;
