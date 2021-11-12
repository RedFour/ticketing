import React, { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import { CurrentUser } from '../interfaces/current-user';

const initialAuthContext: CurrentUser = {
  currentUser: null,
};

const AppContext = createContext<CurrentUser>(initialAuthContext);

export function AuthWrapper({ children }: { children: ReactNode }) {
  let sharedState = initialAuthContext;

  return (
    <AppContext.Provider value={sharedState}>{children}</AppContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AppContext);
}
