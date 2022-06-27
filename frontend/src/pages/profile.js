import { useAuth0 } from "@auth0/auth0-react";
import React from "react";

export const Profile = () => {
  const { user } = useAuth0();

  if (!user) {
    return null;
  }

  return (

    <div className="ui container">
      <div className="header-edit">
        <h2 className="ui aligned header">Profile</h2>
      </div>

      <p>
        Logged in as {user.email}
      </p>


    </div>
  );
};
