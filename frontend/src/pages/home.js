import React, { Fragment } from "react";
import { Auth0Features } from "../components/auth0-features";
import { useState } from "react";
import { Link } from 'react-router-dom';
import { useExternalApi } from "../utils/requests";
import { List } from 'semantic-ui-react'

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
  
      const { data } = await makeRequest({ config });
      setTournaments(data);
    }

    getTournaments()
  }, [])

  return <Fragment>
    <h1>Tournaments</h1>
    <List divided relaxed>
    {tournaments.map(t => (

  <List.Item>
    <List.Icon name='angle right' size='large' verticalAlign='middle' />
    <List.Content>
      <List.Header as='a'><Link to={`/tournaments/${t.shortName}`}>{t.name}</Link></List.Header>
      <List.Description>
        {t.startDate} - {t.endDate}
      </List.Description>
    </List.Content>
  </List.Item>
  
    ))}
  </List>
  </Fragment>
}

export const Home = () => (
  <div className="ui container">    
    {/* <Auth0Features /> */}
    <Tournaments />
  </div>
);
