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

      const data = await makeRequest({ config, authenticated: true });
      // setUserStored(true);
    }    

    storeUser(user)
  }, [user])

  if (!user) {
    return null;
  }

  if (!userStored) {
    return (
      <div className="content-layout">
        <h1 className="content__title">Auth Check</h1>
        <div className="content__body">
          <p>
            You can use the ID Token to get the profile information of an
            authenticated user.
            <br />
            <strong>Only authenticated users can access this page.</strong>
          </p>
          <div className="profile-grid">
            <div className="profile__header">
              <img src={user.picture} alt="Profile" className="profile__avatar" />
              <div className="profile__headline">
                <h2 className="profile__title">{user.name}</h2>
                <span className="profile__description">{user.sub}</span>
              </div>
            </div>
           
          </div>
        </div>
      </div>
    );
  }

  return <Redirect to="/"></Redirect>
};
