import React, { Fragment } from "react";
import { useState } from "react";
import { useParams } from 'react-router-dom';
import { useExternalApi } from "../utils/requests";


export const Tournaments = () => {
  const { tournamentId } = useParams();

  const [data, setData] = useState({events: []})

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

    getTournament(tournamentId)
  }, [tournamentId])

  const Bracket = ({ bracket }) => {
    if (!bracket.player1 && !bracket.player2) {
      return <div>{bracket.round} - N/A</div>
    }

    return <div>

      {bracket.round} - 

      {bracket.round == "Champion" && bracket.player1}
      {bracket.round != "Champion" && bracket.player1 + " vs " + bracket.player2}
    </div>
  }

  return <Fragment>    
    <div className="content-layout">
      <h1 className="content__title">{data.name}</h1>
      {data.events.map(event => (
        <div>
          <h2 className="content__title">{event.name}</h2>
          {event.brackets.map(bracket => (
            <Bracket bracket={bracket} />
            
          ))}

          </div>
      ))}
    </div>
  </Fragment>
};
