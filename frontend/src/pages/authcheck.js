import { useAuth0 } from "@auth0/auth0-react";
import React, { useState } from "react";
import { Redirect } from "react-router-dom";
import { CodeSnippet } from "../components/code-snippet";
import { useExternalApi } from "../utils/requests";

export const AuthCheck = () => {
  const [userStored, setUserStored] = useState(false)

  const { user } = useAuth0();

  const {
    makeRequest,
    apiServerUrl
  } = useExternalApi();

  React.useEffect(() => {
    const storeUser = async (user) => {
      const config = {
        url: `${apiServerUrl}/api/users/`,
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        data: {
          "name": user.name,
          "email": user.email
        }
      };

      const { data } = await makeRequest({ config, authenticated: true });
      setUserStored(true);
    }    

    storeUser(user)
  }, [user])

  if (!user) {
    return null;
  }

  if (!userStored) {
    return (
      <div className="ui container">
      <div className="header-edit">
        <h2 className="ui aligned header">Logging in...</h2>
      </div>

      <p>
        You are now logged in as {user.email}.
      </p>
      <p>
        You will shortly be redirected to the home page.
      </p>


    </div>
    );
  }

  return <Redirect to="/"></Redirect>
};
