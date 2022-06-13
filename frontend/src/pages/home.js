import React, { Fragment } from "react";
import { Auth0Features } from "../components/auth0-features";
import { useState } from "react";
import { Link } from 'react-router-dom';
import { useExternalApi } from "../utils/requests";

const Tournaments = () => {
  const [tournaments, setTournaments] = useState([])

  const {
    makeRequest,
    apiServerUrl
  } = useExternalApi();

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

  return <div className="auth0-features">
    <h2 className="auth0-features__title">Tournaments</h2>
    <ul>
    {tournaments.map(t => (
      <li className="content__body">
        <Link to={`/tournaments/${t.shortName}`}>{t.name}</Link>
        
        </li>
    ))}
    </ul>
  </div>
}

export const Home = () => (
  <Fragment>    
    {/* <Auth0Features /> */}
    <Tournaments />
  </Fragment>
);
