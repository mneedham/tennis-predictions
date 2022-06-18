import React, { Fragment } from "react";
import { useState } from "react";
import { useParams } from 'react-router-dom';
import { useExternalApi } from "../utils/requests";
import { useAuth0 } from "@auth0/auth0-react";

const _ = require('underscore');

export const Tournaments = () => {
  const { tournamentId } = useParams();
  const { isAuthenticated } = useAuth0();

  const [data, setData] = useState({ events: [] })

  const {
    makeRequest,
    apiServerUrl
  } = useExternalApi();

  React.useEffect(() => {
    const getTournament = async (tournamentId) => {
      const config = {
        url: `${apiServerUrl}/api/tournaments/${tournamentId}`,
        method: "GET",
        headers: {
          "content-type": "application/json",
        }
      };

      const data = await makeRequest({ config });
      setData(data);
    }

    const getTournamentAuthenticated = async (tournamentId) => {
      const config = {
        url: `${apiServerUrl}/api/tournaments/${tournamentId}/me`,
        method: "GET",
        headers: {
          "content-type": "application/json",
        }
      };

      const data = await makeRequest({ config, authenticated: true });
      setData(data);
    }    

    if(isAuthenticated) {
      getTournamentAuthenticated(tournamentId)
    } else {
      getTournament(tournamentId)
    }
  }, [tournamentId])

  // const Bracket = ({ bracket }) => {
  //   if (!bracket.player1 && !bracket.player2) {
  //     return <div className="content__body">{bracket.round} - N/A</div>
  //   }

  //   return <div className="content__body">

  //     {bracket.round} -

  //     {bracket.round === "Champion" && bracket.player1}
  //     {bracket.round !== "Champion" && bracket.player1 + " vs " + bracket.player2}
  //   </div>
  // }

  const Bracket = ({ bracket }) => {
    if (!bracket.player1 && !bracket.player2) {
      return  <tr><td colSpan="2">N/A</td></tr>
    }

    if(bracket.round === "Champion") {
      return <tr><td colSpan="2">{bracket.player1}</td></tr>
    }

    return <tr>
      <td width="50%">
        {bracket.player1}
      </td>
      <td width="50%">
        {bracket.player2}
      </td>
    </tr>
  }

  data.events.forEach(event => {  
    const rounds = Array.from(new Set(event.brackets.map( i => i.round)));
    const groups= rounds.map( round => { 
      return  { round:round, brackets:[]};
    } ); 

    event.brackets.forEach( d => { 
        groups.find( g => g.round === d.round).brackets.push(d);
    });
    event.newBrackets = groups
  })
  console.log("data", data)


  return <Fragment>
    <div class="ui container">
    <h1 class="ui aligned header">{ data.name }</h1>
    <div class="column">
    <table id="players">
      {data.events.map(event => (
        <Fragment>
          <h2 class="ui aligned header">{ event.name }</h2>
          {event.newBrackets.map(b => (
            <Fragment>
            <tr>
              <th colSpan="2">{b.round}</th>
            </tr>
            {b.brackets.map(bracket => (
                <Bracket bracket={bracket} />
            ))}
            
            </Fragment>
          ))}
</Fragment>
      ))}
      </table>
      </div>
    </div>
  </Fragment>
};
