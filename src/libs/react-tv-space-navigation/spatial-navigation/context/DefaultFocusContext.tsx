import { createContext, ReactNode, useContext } from 'react';

const SpatialNavigatorDefaultFocusContext = createContext<boolean>(false);

export const useSpatialNavigatorDefaultFocus = () => {
  const spatialNavigatorDefaultFocus = useContext(SpatialNavigatorDefaultFocusContext);
  return spatialNavigatorDefaultFocus;
};

type Props = {
  children: ReactNode;
  enable?: boolean;
};

export const DefaultFocus = ({ children, enable = true }: Props) => {
  return (
    <SpatialNavigatorDefaultFocusContext.Provider value={enable}>
      {children}
    </SpatialNavigatorDefaultFocusContext.Provider>
  );
};
