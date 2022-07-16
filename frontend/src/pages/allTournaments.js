import React, { Fragment } from "react";
import { Auth0Features } from "../components/auth0-features";
import { useState } from "react";
import { Link } from 'react-router-dom';
import { useExternalApi } from "../utils/requests";
import { List } from 'semantic-ui-react'

import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css'

import { Icon, Input, Tab, Button } from 'semantic-ui-react'


const Tournaments = () => {
  const [tournaments, setTournaments] = useState([])

  const [addNewEvent, setAddNewEvent] = useState(false)

  const NewTournament = () => {
    return <List.Item>

      <List.Icon color='green' name='trophy' size='large' verticalAlign='top' />
      <List.Content style={{ width: "500px" }}>
        <List.Header>
          <Input fluid className="newTournament" placeholder="Event Name" size="mini" />
        </List.Header>
        <List.Description>
          <div className="newTournament dates">
          <Input className="newTournament date" placeholder="Start Date" size="mini" />
          <Input className="newTournament date" placeholder="End Date" size="mini" />
          </div>
        </List.Description>
        <Button className="newTournament" color='green'>Create Event</Button>
      </List.Content>
    </List.Item>
  }

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
      // setTimeout(() => {
      //   setTournaments(data);
      // }, 2000)
      setTournaments(data);
      
    
    }

    getTournaments()
  }, [])

  if (tournaments.length == 0) {
    return <Fragment>
      <h1>Events</h1>
      <List relaxed >
        {Array(10).fill().map((item, index) => (
          <List.Item style={{ display: "flex" }}>

            <List.Icon name='trophy' size='large' verticalAlign='middle' />
            <List.Content style={{ width: "100%" }}>
              <List.Description>
                <Skeleton height={8} width="300px" count={2} />
              </List.Description>
            </List.Content>
          </List.Item>

        ))}
      </List>

    </Fragment>
  }

  return <Fragment>
    <h1>Events</h1>
    <List relaxed>
      {/* <NewTournament /> */}
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
  </Fragment>
}

export const AllTournaments = () => (
  <div className="ui container">    
    <Tournaments />
  </div>
);
