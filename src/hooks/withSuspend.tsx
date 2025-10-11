import Loader from 'Component/Loader';
import React, { ComponentType, Suspense } from 'react';

export const withSuspend = <P extends object>(Component: ComponentType<P>): any => {
  return (props: P) => (
    <Suspense
      fallback={ (
        <Loader isLoading fullScreen />
      ) }
    >
      <Component { ...props } />
    </Suspense>
  );
};