import React, { Fragment } from "react";
import { useState } from "react";
import { useParams } from 'react-router-dom';
import { useExternalApi } from "../utils/requests";
import { useAuth0 } from "@auth0/auth0-react";
import { Icon, Input, Tab } from 'semantic-ui-react'

import { SemanticToastContainer, toast } from 'react-semantic-toasts';
import 'react-semantic-toasts/styles/react-semantic-alert.css';

import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css'

import {NewBracket, NewUnauthenticatedBracket} from './brackets'

export const Tournaments = () => {
  const { tournamentId } = useParams();
  const { isAuthenticated } = useAuth0();

  const [data, setData] = useState({ events: [] })
  const [mode, setMode] = useState("view")
  const [brackets, setBrackets] = useState({})
  const [userProfile, setUserProfile] = useState({editor: false})

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

    if (isAuthenticated) {
      getTournamentAuthenticated(tournamentId)
      getUserProfile()
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

  const updateResult = async (bracketId, player1, player2) => {
    setBrackets(state => ({
      ...state, [bracketId]: { ...state[bracketId], actualPlayer1: player1, actualPlayer2: player2 }
    }))

    const config = {
      url: `${apiServerUrl}/api/tournaments/${tournamentId}/result/${bracketId}`,
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
        title: 'Result updated',
        description: `${bracketId} successfully updated`,
        animation: 'slide up',
        time: 1000
      });
    } else {
      toast({
        type: 'error',
        icon: 'envelope',
        title: 'Result not updated',
        description: `${bracketId} was not updated`,
        animation: 'slide up',
        time: 1000
      }); 
    }
  }  

  const NewEditableBracket = ({ bracket }) => {
    const [player1, setPlayer1] = useState(brackets[bracket.id]["player1"])
    const [player2, setPlayer2] = useState(brackets[bracket.id]["player2"])

    if(bracket.round === "Champion") {
      return <Fragment>
      <div className="cell">
        <Input fluid 
              icon={player1 !== brackets[bracket.id]["player1"] ? "pencil" : null}
              key={bracket.id + "player1__formInput"}
              value={player1}
              onChange={(_, data) => setPlayer1(data.value)}
              onBlur={() => {
                if(player1 !== brackets[bracket.id]["player1"]) {
                  updateBracket(bracket.id, player1, player2)
                }
              }}
            />
      </div>
      <div className="cell update-bracket" onClick={() => updateBracket(bracket.id, player1)}>
        <Icon name="checkmark" color="green" size="large" />
      </div>
      </Fragment>
    }

    return <Fragment>
    <div className="cell left">
      <Input fluid 
            icon={player1 !== brackets[bracket.id]["player1"] ? "pencil" : null}
            key={bracket.id + "player1__formInput"}
            value={player1}
            onChange={(_, data) => setPlayer1(data.value)}
            onBlur={() => {
              if(player1 !== brackets[bracket.id]["player1"]) {
                updateBracket(bracket.id, player1, player2)
              }
            }}
          />
    </div>
    <div className="cell right">
    <Input fluid 
          icon={player2 !== brackets[bracket.id]["player2"] ? "pencil" : null}
          key={bracket.id + "player2_formInput"}
          value={player2}
          onChange={(_, data) => setPlayer2(data.value)}
          onBlur={() => {
            if(player2 !== brackets[bracket.id]["player2"]) {
              updateBracket(bracket.id, player1, player2)
            }
          }}
        />    
    </div>
    <div className="cell update-bracket" onClick={() => updateBracket(bracket.id, player1, player2)}>
      <Icon name="checkmark" color="green" size="large" />
    </div>
    </Fragment>
  }


  const AdminBracket = ({bracket}) => {
    const [player1, setPlayer1] = useState(brackets[bracket.id].actualPlayer1)
    const [player2, setPlayer2] = useState(brackets[bracket.id].actualPlayer2)

    if(bracket.round === "Champion") {
      return <Fragment>
      <div className="cell">
        <Input fluid 
              icon={player1 !== brackets[bracket.id]["actualPlayer1"] ? "pencil" : null}
              key={bracket.id + "_admin_player1__formInput"}
              value={player1}
              onChange={(_, data) => setPlayer1(data.value)}
              onBlur={() => {
                if(player1 !== brackets[bracket.id]["actualPlayer1"]) {
                  updateResult(bracket.id, player1, player2)
                }
              }}
            />
      </div>
      <div className="cell update-bracket" onClick={() => updateResult(bracket.id, player1)}>
        <Icon name="checkmark" color="green" size="large" />
      </div>
      </Fragment>
    }

    return <Fragment>
    <div className="cell left">
      <Input fluid
            icon={player1 !== brackets[bracket.id]["actualPlayer1"] ? "pencil" : null}
            key={bracket.id + "_admin_player1__formInput"}
            value={player1}
            onChange={(_, data) => setPlayer1(data.value)}
            onBlur={() => {
              if(player1 !== brackets[bracket.id]["actualPlayer1"]) {
                updateResult(bracket.id, player1, player2)
              }
            }}
          />
    </div>
    <div className="cell right">
    <Input fluid 
          icon={player2 !== brackets[bracket.id]["actualPlayer2"] ? "pencil" : null}
          key={bracket.id + "_admin_player2_formInput"}
          value={player2}
          onChange={(_, data) => setPlayer2(data.value)}
          onBlur={() => {
            if(player2 !== brackets[bracket.id]["actualPlayer2"]) {
              updateResult(bracket.id, player1, player2)
            }
          }}
        />    
    </div>
    <div className="cell update-bracket" onClick={() => updateResult(bracket.id, player1, player2)}>
      <Icon name="checkmark" color="green" size="large" />
    </div>
    </Fragment>
  }


  const NewRow = ({ bracket, mode }) => {
    if (!isAuthenticated) {
      return <NewUnauthenticatedBracket bracket={bracket} />
    }

    switch (mode) {
      case "edit":
        return <NewEditableBracket bracket={bracket} key={bracket.id + "_editableBracket"} />
      case "admin":
        return <AdminBracket bracket={bracket} key={bracket.id + "_adminBracket"} />
      default:
        return <NewBracket bracket={bracket} brackets={brackets} />
    }
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

    event.matches = event.brackets.flatMap(bracket => {
      if(bracket.round === "Champion") {
        return {player: bracket.player1, actualPlayer: bracket.actualPlayer1, round: bracket.round}
      }
      return [
        {player: bracket.player1, actualPlayer: bracket.actualPlayer1, round: bracket.round},
        {player: bracket.player2, actualPlayer: bracket.actualPlayer2, round: bracket.round}
      ]
    })
  })

  const CorrectPicks = ({ matches }) => {
    const correct = matches.filter(match => match.actualPlayer !== null && match.player === match.actualPlayer).length
    const finished = matches.filter(match => match.actualPlayer !== null).length

    return <Fragment>{`${correct} / ${finished}`}</Fragment>
  }

  const Score = ({ matches }) => {
    const rounds = {
      "4th Round": 1,
      "Quarter Finals": 2,
      "Semi Finals": 4,
      "Final": 8,
      "Champion": 16
    }

    const multiplier = (round, numberOfMatches) => {
      return numberOfMatches === 31 ?  rounds[round] : rounds[round] / 2
    }

    const score = matches
      .filter(match => match.actualPlayer !== null)
      .map(match => match.player === match.actualPlayer ? 1 * multiplier(match.round, matches.length) : 0)
      .reduce((a,b) => a+b, 0)

    return <Fragment>{score}</Fragment>
  }

  const panes = data.events.map(event => {
    return {
      menuItem: event.name,
      render: () => <Fragment key={event.name}>
        {event.newBrackets.map((b, index) => {
          return <div className="players">
            <div className="header">{b.round}</div>
            <div className="bracket" data-round={b.round} data-mode={mode}>
              {b.brackets.map((bracket, index) => (
                <NewRow bracket={bracket} mode={mode} key={index + "_row"} />
              ))}

            </div></div>
        })}
        <div className="picks">
          <div className="pick-column">
            <div className="text">Correct Picks:</div> 
            <div className="score">
              <CorrectPicks matches={event.matches} />
            </div>
          </div>
          <div className="pick-column">
            <div className="text">Score:</div>
            <div className="score"><Score matches={event.matches} /></div>
          </div>
        </div>
      </Fragment>
    }
  })

  const dummyPanes = Array(1).fill().map(index => {
    return {
      menuItem: "Event Name",
      render: () => <div className="players">
        <div className="header loading"></div>
        <div className="bracket" data-round="Champion">
        {Array(5).fill().map((item) => {
          return <div className="cell">
              <Skeleton  height="60px" borderRadius="10px" />
          </div>
        })}
        </div>
        
      </div>
    }
  })

  if(!data.name) {
    return <Fragment>
      <div className="ui container" key={data.name}>
        <div>
          <div className="header-edit loading">
            <div>
              <Skeleton count={1} width="250px" height="30px" />
            </div>
            <div>
            <Skeleton count={1} width="50px" height="30px" />
            </div>
          </div>
          <div className="header-meta loading">
          <Skeleton count={1} width="200px" height="20px" />
          </div>
        </div>
        <div className="column">
          <Tab panes={dummyPanes} />
        </div>
      </div>
  </Fragment>

  }
  
  return <Fragment>
    <SemanticToastContainer />
    <div className="ui container" key={data.name}>
      <div>
        <div className="header-edit">
          <h2 className="ui aligned header" style={{ maxWidth: "75%" }}>{data.name}</h2>
          <div>
            {isAuthenticated && data.editable && data.name && <Fragment>
              <Icon color={mode === "view" ? "green" : "black"} name='eye' size='large' onClick={() => setMode("view")} />
              <Icon color={mode === "edit" ? "green" : "black"} name='edit' size='large' onClick={() => setMode("edit")} />
              <Icon color={mode === "admin" ? "green" : "black"} name='cog' size='large' onClick={() => setMode("admin")} />
            </Fragment>}
            {isAuthenticated && !data.editable && data.name && userProfile.editor && <Fragment>
              <Icon color={mode === "view" ? "green" : "black"} name='eye' size='large' onClick={() => setMode("view")} />
              <Icon color={mode === "admin" ? "green" : "black"} name='cog' size='large' onClick={() => setMode("admin")} />
            </Fragment>}
          </div>
        </div>
        <div className="header-meta">
          {data.startDate} - {data.endDate}
        </div>
      </div>
      
      <div className="column">        
        {panes.length > 0 && <Tab panes={panes} />}
      </div>
    </div>
  </Fragment>
};
