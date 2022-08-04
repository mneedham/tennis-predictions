import React, { Fragment } from "react";
import { useState } from "react";
import { Link } from 'react-router-dom';
import { useExternalApi } from "../utils/requests";
import { List } from 'semantic-ui-react'

import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css'

const Tournaments = () => {
  const [tournaments, setTournaments] = useState()

  const {
    makeRequest,
    apiServerUrl
  } = useExternalApi();

  React.useEffect(() => {
    const getTournaments = async () => {
      const config = {
        url: `${apiServerUrl}/api/tournaments/latest`,
        method: "GET",
        headers: {
          "content-type": "application/json",
        }        
      };
  
      const { data } = await makeRequest({ config });
      // setTimeout(() => {
      //   setTournaments(data);
      // }, 2000)
      setTournaments(data);
    
    }

    getTournaments()
  }, [])

  if(!tournaments) {
    return <Fragment>
      <h1>Current Events</h1>
      <List relaxed >
      {Array(10).fill().map((item, index) => (
          <List.Item style={{display: "flex"}}>
    
          <List.Icon name='trophy' size='large' verticalAlign='middle' />
          <List.Content style={{width: "100%"}}>
            <List.Description>
              <Skeleton height={8} width="300px" count={2}  />               
            </List.Description>
          </List.Content>
        </List.Item>
        
      ))}
      </List>

      <Link to={`/tournaments`}>↗ All Tournaments</Link>
      
    </Fragment>    
  }

  if(tournaments.length === 0) {
    return <Fragment>
      <h1>Current Events</h1>
      <div>
        There are no current events. See <Link to={`/tournaments`}>↗ All Tournaments</Link>
      </div>

      
      
    </Fragment>
  }

  return <Fragment>
    <h1>Current Events</h1>
    <List relaxed>
    {tournaments.map(t => (

  <List.Item>
    
    <List.Icon name='trophy' size='large' verticalAlign='middle' />
    <List.Content>
      <List.Header as='a'><Link to={`/tournaments/${t.shortName}`}>{t.name}</Link></List.Header>
      <List.Description>
        {t.startDate} - {t.endDate}        
      </List.Description>
    </List.Content>
  </List.Item>
  
    ))}
  </List>
  <Link to={`/tournaments`}>↗ All Events</Link>
  </Fragment>
}

export const Home = () => (
  <div className="ui container">    
    {/* <Auth0Features /> */}
    <Tournaments />
  </div>
);
