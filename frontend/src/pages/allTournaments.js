import React, { Fragment } from "react";
import { useState } from "react";
import { Link } from 'react-router-dom';
import { useExternalApi } from "../utils/requests";
import { List } from 'semantic-ui-react'
import { useAuth0 } from "@auth0/auth0-react";

import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css'

import { Icon, Input, Tab, Button } from 'semantic-ui-react'

import { SemanticToastContainer, toast } from 'react-semantic-toasts';
import 'react-semantic-toasts/styles/react-semantic-alert.css';

import { Checkbox, Radio } from 'semantic-ui-react'

import {
  DateInput,
  TimeInput,
  DateTimeInput,
  DatesRangeInput
} from 'semantic-ui-calendar-react';

const Tournaments = () => {
  const { isAuthenticated } = useAuth0();
  const [tournaments, setTournaments] = useState([])
  const [addNewEvent, setAddNewEvent] = useState(false)
  const [userProfile, setUserProfile] = useState({editor: false})

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

    const getUserProfile = async () => {
      const config = {
        url: `${apiServerUrl}/api/users/profile`,
        method: "GET",
        headers: {
          "content-type": "application/json",
        }
      };

      const response = await makeRequest({ config, authenticated: true });

      setUserProfile(response.data);
    }       

    getTournaments()

    if (isAuthenticated) {
      getUserProfile()
    }
  }, [])

  const AddNewEventButton = ({userProfile}) => {
    if(isAuthenticated && userProfile) {
      return <Icon 
        name="circle plus" color={addNewEvent ? "grey":"green"} size="small" onClick={() => setAddNewEvent(prev => !prev)} 
        />
      
    } else {
      return <Fragment></Fragment>;
    }
  }  

  const NewTournament = () => {
    const [eventName, setEventName] = useState("")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")

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

    const addNewTournament = () => {
      console.log("events", events)

      const postTournament = async () => {
        const config = {
          url: `${apiServerUrl}/api/tournaments/new`,
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          data: {
            name: eventName,
            startDate: startDate,
            endDate: endDate,
            events: events
          }    
        };
    
        const response = await makeRequest({ config, authenticated: true });
        
        if (response.status === 200) {
          toast({
            type: 'success',
            icon: 'envelope',
            title: 'Event updated',
            description: `${eventName} successfully updated`,
            animation: 'slide up',
            time: 1000
          });
        } else {
          toast({
            type: 'error',
            icon: 'envelope',
            title: 'Event not updated',
            description: `${eventName} was not updated`,
            animation: 'slide up',
            time: 1000
          }); 
        }
        return response.status
      }

      const status = postTournament()
      status.then(value => {
        if(value) {
          getTournaments()
          setAddNewEvent(prev => !prev)
        }
      })
    }

    const [events, setEvents] = useState({
      "Men's Singles": { name: "Men's Singles", round: "R4", selected: true },
      "Women's Singles": { name: "Women's Singles", round: "R4", selected: true }
    })

    const Event = ({name}) => {
      const event = events[name] || {}

      return <div className="event">
        <Checkbox label={name}
          style={{width: "140px"}}
          checked={event.selected}
          onClick={() => setEvents(prevState => {
            return {...prevState, [name]: {name: name, round: prevState[name].round, selected: !prevState[name].selected}}
          })}
        />
        <div>
        <Radio
          label='R4'
          style={{marginRight: "10px"}}
          name={name}
          value='R4'
          checked={event.round === "R4"}
          onChange={(e, data) => setEvents(prevState => {
            return {...prevState, [name]: {name: name, round: data.value, selected: prevState[name].selected}}
          })}
        />
        <Radio
          label='QF'
          name={name}
          value='QF'
          checked={event.round === "QF"}
          onChange={(e, data) => setEvents(prevState => {
            return {...prevState, [name]: {name: name, round: data.value, selected: prevState[name].selected}}
          })}
        />
        </div>
      </div>
    }


    return <List.Item>
      <List.Icon color='green' name='trophy' size='large' verticalAlign='top' />
      <List.Content style={{ width: "500px" }}>
        <List.Header>
          <Input fluid className="newTournament"
            value={eventName}
            onChange={(_, { value }) => setEventName(value)}
            placeholder="Event Name" size="mini" />
        </List.Header>
        <List.Description>
          <div className="newTournament dates">
            <DateInput className="newTournament date"
              name="date"
              dateFormat="YYYY-MM-DD"
              placeholder="Start Date"
              value={startDate}
              iconPosition="left"
              popupPosition="bottom left"
              size="mini"
              onChange={(_, { value }) => setStartDate(value)}
            />

            <DateInput className="newTournament date"
              name="date"
              dateFormat="YYYY-MM-DD"
              placeholder="End Date"
              value={endDate}
              iconPosition="left"
              popupPosition="bottom left"
              size="mini"
              onChange={(_, { value }) => setEndDate(value)}
            />            
          </div>

          <div className="events">
            <div className="heading">
              <div className="left">Event name</div>
              <div className="right">1st round to predict</div>
            </div>
            <Event name="Men's Singles" />
            <Event name="Women's Singles" />
          </div>

        </List.Description>
        <Button className="newTournament" color='green' style={{marginTop: "5px"}} onClick={addNewTournament}>Create Event</Button>
      </List.Content>
    </List.Item>
  }  

  if (tournaments.length == 0) {
    return <Fragment>      
      <h1>Events <AddNewEventButton userProfile={userProfile} /></h1>
      {addNewEvent && isAuthenticated && userProfile.editor && <NewTournament />}
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
    <h1>Events <AddNewEventButton userProfile={userProfile} /></h1>
    <List relaxed>
      {addNewEvent && isAuthenticated && userProfile.editor && <NewTournament />}
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
    <SemanticToastContainer />
    <Tournaments />
  </div>
);
