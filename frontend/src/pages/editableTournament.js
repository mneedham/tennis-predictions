import React, { Fragment } from "react";
import { useState } from "react";
import { useParams } from 'react-router-dom';
import { useExternalApi } from "../utils/requests";
import { useAuth0 } from "@auth0/auth0-react";
import { Icon, Form } from 'semantic-ui-react'

export const EditableTournaments = () => {
  const { tournamentId } = useParams();
  const { isAuthenticated } = useAuth0();

  const [data, setData] = useState({ events: [] })

  const {
    makeRequest,
    apiServerUrl
  } = useExternalApi();

  React.useEffect(() => {

    const getTournamentAuthenticated = async (tournamentId) => {
      const config = {
        url: `${apiServerUrl}/api/tournaments/${tournamentId}/me`,
        method: "GET",
        headers: {
          "content-type": "application/json",
        }
      };

      const { data } = await makeRequest({ config, authenticated: true });
      setData(data);
    }
    getTournamentAuthenticated(tournamentId)
  }, [tournamentId])

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
      <h1 className="ui aligned header">{data.name} <Icon name='edit' size='mini' /></h1>
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
                    <tr>
                    <td width="50%">
                      <Form.Field>
                        <Form.Input fluid />
                      </Form.Field>
                    </td>
                    <td width="50%">
                      <Form.Input fluid />
                    </td>
                  </tr>
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
