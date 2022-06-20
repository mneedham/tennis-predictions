import React, { Fragment } from "react";
import { useState } from "react";
import { useParams, Link } from 'react-router-dom';
import { useExternalApi } from "../utils/requests";
import { useAuth0 } from "@auth0/auth0-react";
import { Icon, Input } from 'semantic-ui-react'


export const Tournaments = () => {
  const { tournamentId } = useParams();
  const { isAuthenticated } = useAuth0();

  const [data, setData] = useState({ events: [] })
  const [mode, setMode] = useState("view")
  const [brackets, setBrackets] = useState({})

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
      console.log("data", data)

      const b = {}
      data.events.forEach(event => {
        event.brackets.forEach(bracket => {
          b[bracket.id] = {"player1": b.player1, "player2": b.player2}
        })
      })

      setData(data);
      setBrackets(b)
    }

    if (isAuthenticated) {
      getTournamentAuthenticated(tournamentId)
    } else {
      getTournament(tournamentId)
    }
  }, [tournamentId])

  const updateBracket = async (bracketId, player1, player2) => {
    setBrackets(state => ({
      ...state, [bracketId]: { ...state[bracketId], player1: player1, player2: player2 }
    }))

    console.log("bracketId", bracketId, "data", data)

    const config = {
      url: `${apiServerUrl}/api/tournaments/${tournamentId}/bracket/${bracketId}`,
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      data: {
        "player1": player1,
        "player2": player2
      }
    };

    const response = await makeRequest({ config, authenticated: true });
    console.log("response", response)
  }


  const EditableBracket = ({ bracket }) => {
    const [player1, setPlayer1] = useState(brackets[bracket.id]["player1"])
    const [player2, setPlayer2] = useState(brackets[bracket.id]["player2"])

    if(bracket.round === "Champion") {
      return <tr key={bracket.id + "_row"}>
        <td colSpan="2">
          <Input fluid focus
            key={bracket.id + "_player1_formInput"}
            value={player1}
            onChange={(_, data) => setPlayer1(data.value)}
          />
        </td>
        <td key={bracket.id + "update"} onClick={() => updateBracket(bracket.id)}>Update</td>
      </tr>
    }

    return <tr key={bracket.id + "_row"}>
      <td width="50%">
        <Input fluid focus
          key={bracket.id + "player1__formInput"}
          value={player1}
          onChange={(_, data) => setPlayer1(data.value)}
        />
      </td>
      <td width="50%">
        <Input fluid focus
          key={bracket.id + "player2_formInput"}
          value={player2}
          onChange={(_, data) => setPlayer2(data.value)}
        />    
      </td>
      <td key={bracket.id +"update"} onClick={() => updateBracket(bracket.id, player1, player2)}>Update</td>
    </tr>
  }

  const Bracket = ({ bracket }) => {
    if (!bracket.player1 && !bracket.player2) {
      return <tr><td colSpan="2">N/A</td></tr>
    }

    if (bracket.round === "Champion") {
      return <tr>
        <td colSpan="2">{bracket.player1}</td>        
        </tr>
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

  const Row = ({bracket, mode}) => {
    if(mode === "edit") {
      return <EditableBracket bracket={bracket} key={bracket.id + "_editableBracket"} />
    }
    return <Bracket bracket={bracket} />
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

  console.log("brackets", brackets)

  return <Fragment>
    <div className="ui container" key={data.name}>
      <h1 className="ui aligned header">{data.name}</h1>
      <Icon color={mode === "edit" ? "green" : "black"} name='edit' size='large' onClick={() => setMode("edit")} />
      <Icon color={mode === "view" ? "green" : "black"} name='eye' size='large' onClick={() => setMode("view")} />
      <div className="column">
        
          {data.events.map(event => (
            <Fragment key={event.name}>
              <h2 className="ui aligned header">{event.name}</h2>
              <table id="players" key="players_table">
              {event.newBrackets.map((b, index) => (
                <Fragment key={index}>
                  <thead key={b.round + "_thead"}> 
                    <tr>
                      <th colSpan={mode === "view" ? "2" : "3"}>{b.round}</th>
                    </tr>
                  </thead>
                  <tbody key={b.round + "_tbody"}>
                    {b.brackets.map((bracket, index) => (                                      
                      <Row bracket={bracket} mode={mode} key={index + "_row"} />
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
