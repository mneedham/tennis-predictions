import React, { Fragment } from "react";
import { Auth0Features } from "../components/auth0-features";
import { useState } from "react";
import { useEnv } from "../context/env.context";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

const Tournaments = () => {
  const [tournaments, setTournaments] = useState([])

  const { apiServerUrl } = useEnv();
  const { getAccessTokenSilently } = useAuth0();
  const makeRequest = async (options) => {
    try {
      if (options.authenticated) {
        const token = await getAccessTokenSilently();

        options.config.headers = {
          ...options.config.headers,
          Authorization: `Bearer ${token}`,
        };
      }

      const response = await axios(options.config);
      const { data } = response;

      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }

      return error.message;
    }
  };

  React.useEffect(() => {
    const getTournaments = async () => {
      const config = {
        url: `${apiServerUrl}/api/tournaments`,
        method: "GET",
        headers: {
          "content-type": "application/json",
        }        
      };
  
      const data = await makeRequest({ config });
      setTournaments(data);
    }

    getTournaments()
  }, [])

  return <div>
    <h2 className="auth0-features__title">Tournaments</h2>
    <ul>
    {tournaments.map(t => {
      return <li>{t.name}</li>
    })}
    </ul>
  </div>
}

export const Home = () => (
  <Fragment>    
    <Auth0Features />
    <Tournaments />
  </Fragment>
);
