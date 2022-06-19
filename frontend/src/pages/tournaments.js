import React, { Fragment } from "react";
import { useState } from "react";
import { useParams } from 'react-router-dom';
import { useExternalApi } from "../utils/requests";
import { useAuth0 } from "@auth0/auth0-react";

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

    if (isAuthenticated) {
      getTournamentAuthenticated(tournamentId)
    } else {
      getTournament(tournamentId)
    }
  }, [tournamentId])

  const Bracket = ({ bracket }) => {
    if (!bracket.player1 && !bracket.player2) {
      return <tr><td colSpan="2">N/A</td></tr>
    }

    if (bracket.round === "Champion") {
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
    const rounds = Array.from(new Set(event.brackets.map(i => i.round)));
    const groups = rounds.map(round => {
      return { round: round, brackets: [] };
    });

    event.brackets.forEach(d => {
      groups.find(g => g.round === d.round).brackets.push(d);
    });
    event.newBrackets = groups
  })

  return <Fragment>
    <div className="ui container">
      <h1 className="ui aligned header">{data.name}</h1>
      <div className="column">
        
          {data.events.map(event => (
            <Fragment>
              <h2 className="ui aligned header">{event.name}</h2>
              <table id="players">
              {event.newBrackets.map(b => (
                <Fragment key={b.round}>
                  <thead>
                  <tr>
                    <th colSpan="2">{b.round}</th>
                  </tr>
                  </thead>
                  <tbody>
                  {b.brackets.map(bracket => (
                    <Bracket bracket={bracket} />
                  ))}
                  </tbody>

                </Fragment>
              ))}
              </table>
            </Fragment>
          ))}
        
      </div>
    </div>
  </Fragment>
};
