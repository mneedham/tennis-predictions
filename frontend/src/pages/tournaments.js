import React, { Fragment } from "react";
import { Auth0Features } from "../components/auth0-features";
import { useState } from "react";
import { useEnv } from "../context/env.context";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { Link, useParams } from 'react-router-dom';


export const Tournaments = () => {
  const { tournamentId } = useParams();
  return <Fragment>    
    <div>
      <h2>Tournaments: {tournamentId}</h2>

    </div>
  </Fragment>
};
