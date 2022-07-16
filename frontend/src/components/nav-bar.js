import React from "react";
import { NavLink } from "react-router-dom";
import { AuthenticationButton } from "./buttons/authentication-button";

export const NavBar = () => {
  return (
    <div className="nav-bar__container">
      <nav className="nav-bar">
        <div className="nav-bar__brand">
          <NavLink to="/">
            <img
              className="nav-bar__logo"
              src="/noun-tennis-1922615-71D358.png"
              alt="Auth0 shield logo"
              width="35.98"
              height="40"
            />
          </NavLink>
        </div>
        <div className="nav-bar__tabs">
          <NavLink
            to="/profile"
            exact
            className="nav-bar__tab"
            activeClassName="nav-bar__tab--active"
          >
            Profile
          </NavLink>

          <NavLink
            to="/tournaments"
            exact
            className="nav-bar__tab"
            activeClassName="nav-bar__tab--active"
          >
            Events
          </NavLink>
        </div>
        <div className="nav-bar__actions">
          <AuthenticationButton />
        </div>
      </nav>
    </div>
  );
};
