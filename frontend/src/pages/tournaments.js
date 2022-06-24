import React, { Fragment } from "react";
import { useState } from "react";
import { useParams, Link } from 'react-router-dom';
import { useExternalApi } from "../utils/requests";
import { useAuth0 } from "@auth0/auth0-react";
import { Icon, Input, Tab } from 'semantic-ui-react'

import { SemanticToastContainer, toast } from 'react-semantic-toasts';
import 'react-semantic-toasts/styles/react-semantic-alert.css';

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

  const getBrackets = (events) => {
    const b = {}
    events.forEach(event => {
      event.brackets.forEach(bracket => {
        b[bracket.id] = {
          "player1": bracket.player1,
          "player2": bracket.player2, 
          "actualPlayer1": bracket.actualPlayer1,
          "actualPlayer2": bracket.actualPlayer2
        }
      })
    })
    return b
  }

  React.useEffect(() => {
    const getTournament = async (tournamentId) => {
      const config = {
        url: `${apiServerUrl}/api/tournaments/${tournamentId}`,
        method: "GET",
        headers: {
          "content-type": "application/json",
        }
      };

      const response = await makeRequest({ config });
      const b = getBrackets(response.data.events)

      setData(response.data);
      setBrackets(b)
    }

    const getTournamentAuthenticated = async (tournamentId) => {
      const config = {
        url: `${apiServerUrl}/api/tournaments/${tournamentId}/me`,
        method: "GET",
        headers: {
          "content-type": "application/json",
        }
      };

      const response = await makeRequest({ config, authenticated: true });

      const b = getBrackets(response.data.events)
      setData(response.data);
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
    if (response.status === 200) {
      toast({
        type: 'success',
        icon: 'envelope',
        title: 'Bracket updated',
        description: `${bracketId} successfully updated`,
        animation: 'slide up',
        time: 1000
      });
    } else {
      toast({
        type: 'error',
        icon: 'envelope',
        title: 'Bracket not update',
        description: `${bracketId} was not updated`,
        animation: 'slide up',
        time: 1000
      }); 
    }

  }

  const EditableBracket = ({ bracket }) => {
    const [player1, setPlayer1] = useState(brackets[bracket.id]["player1"])
    const [player2, setPlayer2] = useState(brackets[bracket.id]["player2"])

    if(bracket.round === "Champion") {
      return <tr key={bracket.id + "_row"}>
        <td colSpan="2">
          <Input fluid 
          icon={player1 !== brackets[bracket.id]["player1"] ? "pencil" : null}
            key={bracket.id + "_player1_formInput"}
            value={player1}
            onChange={(_, data) => setPlayer1(data.value)}
          />
        </td>
        <td key={bracket.id + "update"} onClick={() => updateBracket(bracket.id, player1)}><Icon name="checkmark" color="green" size="large" /></td>
      </tr>
    }

    return <tr key={bracket.id + "_row"}>
      <td width="50%">
        <Input fluid 
          icon={player1 !== brackets[bracket.id]["player1"] ? "pencil" : null}
          key={bracket.id + "player1__formInput"}
          value={player1}
          onChange={(_, data) => setPlayer1(data.value)}
        />
      </td>
      <td width="50%">
        <Input fluid 
          icon={player2 !== brackets[bracket.id]["player2"] ? "pencil" : null}
          key={bracket.id + "player2_formInput"}
          value={player2}
          onChange={(_, data) => setPlayer2(data.value)}
        />    
      </td>
      <td key={bracket.id +"update"} onClick={() => updateBracket(bracket.id, player1, player2)}><Icon name="checkmark" color="green" size="large" /></td>
    </tr>
  }

  const Bracket = ({ bracket }) => {
    const player1 = (brackets[bracket.id] || {}).player1
    const player2 = (brackets[bracket.id] || {}).player2

    if (!bracket.actualPlayer1 && !bracket.actualPlayer2) {
      return <tr><td colSpan="2">N/A</td></tr>
    }

    const classNamePlayer1 = (bracket.actualPlayer1  === undefined || player1 == undefined) ? "none" :  (bracket.actualPlayer1 === player1 ? "correct" : "incorrect")
    const classNamePlayer2 = (bracket.actualPlayer2 === undefined || player2 == undefined) ? "none" :  (bracket.actualPlayer2 === player2 ? "correct" : "incorrect")

    if (bracket.round === "Champion") {
      return <tr>
        <td className={classNamePlayer1} colSpan="2">
          {player1 === bracket.actualPlayer1 || bracket.actualPlayer1 === undefined ? player1 : <Fragment><strike>{player1}</strike><br />{bracket.actualPlayer1}</Fragment>}
          </td>        
        </tr>
    }

    return <tr>
      <td width="50%" className={classNamePlayer1}>
        {(player1 === bracket.actualPlayer1 || bracket.actualPlayer1 == undefined || player1 === undefined) && player1}
        {(player1 !== bracket.actualPlayer1 && bracket.player1 !== undefined && player1 !== undefined) && <Fragment><strike>{player1}</strike><br />{bracket.actualPlayer1}</Fragment>}        
      </td>
      <td width="50%" className={classNamePlayer2}>
        {(player2 === bracket.actualPlayer2 || bracket.actualPlayer2 == undefined || player2 === undefined) && player2}
        {(player2 !== bracket.actualPlayer2) && <Fragment><strike>{player2}</strike><br />{bracket.actualPlayer2}</Fragment>}   
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

  return <Fragment>
    <SemanticToastContainer />
    <div className="ui container" key={data.name}>
      <div className="header-edit">
        <h2 className="ui aligned header">{data.name}</h2> 
        {isAuthenticated && data.name &&
        <div>
          <Icon color={mode === "edit" ? "green" : "black"} name='edit' size='large' onClick={() => setMode("edit")} />
          <Icon color={mode === "view" ? "green" : "black"} name='eye' size='large' onClick={() => setMode("view")} />
        </div>}
      </div>
      <div className="column">        
          {data.events.map(event => (
            <Fragment key={event.name}>
              <h3 className="ui aligned header">{event.name}</h3>
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
