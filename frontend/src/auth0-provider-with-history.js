import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import React from "react";
import { useHistory } from "react-router-dom";
import { useEnv } from "./context/env.context";

export const Auth0ProviderWithHistory = ({ children }) => {
  const history = useHistory();
  const { domain, clientId, audience } = useEnv();
  
  const onRedirectCallback = async (appState) => {    
    // history.push(appState?.returnTo || window.location.pathname);
    history.replace('/authcheck')
  };

  if (!(domain && clientId && audience)) {
    return null;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      audience={audience}
      redirectUri={window.location.origin}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};
