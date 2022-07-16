import { useAuth0 } from "@auth0/auth0-react";
import React from "react";
import { Route, Switch } from "react-router-dom";
import { NavBar } from "./components/nav-bar";
import { ProtectedRoute } from "./components/protected-route";
import { Home } from "./pages/home";
import { Tournaments } from "./pages/tournaments";
import { AllTournaments } from "./pages/allTournaments";
import { NotFound } from "./pages/not-found";
import { Profile } from "./pages/profile";
import { AuthCheck } from "./pages/authcheck";
import { Dimmer, Loader, Image, Segment } from 'semantic-ui-react'


import 'semantic-ui-css/semantic.min.css'

export const App = () => {
  const { isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div className="container">
           <Dimmer active>
      <Loader />
    </Dimmer>

      </div>
    );
  }

  return (
    <div className="page-layout">
      <NavBar />
      <div className="page-layout__content">
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/tournaments" exact component={AllTournaments} />
          <ProtectedRoute path="/profile" component={Profile} />
          <Route exact path="/tournaments/:tournamentId" component={Tournaments} />
          <ProtectedRoute path="/authcheck" component={AuthCheck} />
          <Route path="*" component={NotFound} />
        </Switch>
      </div>
      {/* <div  class="spacer"> . </div>
      <Footer /> */}
    </div>
  );
};
