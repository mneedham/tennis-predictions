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
    console.log("updateResult", player1, player2)
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


  const computeClass = (player, actualPlayer) => {
    if(actualPlayer === null) {
      return "none"
    }
    if(actualPlayer === player) {
      return "correct"
    } 
    return "incorrect"
  }

  const NewComputeCell = ({player, actualPlayer}) => {
    if(actualPlayer === null) {
      return <Fragment><p>{player}</p></Fragment>
    }

    if(player === null) {
      return <Fragment><p>{actualPlayer}</p></Fragment>
    }

    if(player === actualPlayer) {
      return <Fragment><p>{player}</p></Fragment>
    } else {
      return <Fragment><p><strike>{player}</strike></p><p>{actualPlayer}</p></Fragment>
    }
  }

  const NewBracket = ({bracket}) => {
    const player1 = (brackets[bracket.id] || {}).player1
    const actualPlayer1 = (brackets[bracket.id] || {}).actualPlayer1
    const player2 = (brackets[bracket.id] || {}).player2
    const actualPlayer2 = (brackets[bracket.id] || {}).actualPlayer2

    if (!actualPlayer1 && !actualPlayer2 && !player1 && !player2) {
      return <Fragment>
        <div className="cell left">
          <p>No predictions/No results</p>
        </div>
        <div className="cell right">
          <p>No predictions/No results</p>
        </div>
      </Fragment>
    }

    const classNamePlayer1 = computeClass(player1, actualPlayer1)
    const classNamePlayer2 = computeClass(player2, actualPlayer2)

    if(bracket.round === "Champion") {
      return <Fragment>
      <div className={`cell ${classNamePlayer1}`}>
        <NewComputeCell player={player1} actualPlayer={actualPlayer1} />  
      </div>
    </Fragment>
    }

    return <Fragment>
      <div className={`cell left ${classNamePlayer1}`}>
        <NewComputeCell player={player1} actualPlayer={actualPlayer1} />
      </div>
      <div className={`cell right ${classNamePlayer2}`}>
        <NewComputeCell player={player2} actualPlayer={actualPlayer2} />
      </div>
    </Fragment>
  }

  const AdminBracket = ({bracket}) => {
    const [player1, setPlayer1] = useState(brackets[bracket.id].actualPlayer1)
    const [player2, setPlayer2] = useState(brackets[bracket.id].actualPlayer2)

    console.log("AdminBracket: player1", player1, "player2", player2, "bracket", bracket)

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

  const NewUnauthenticatedBracket = ({bracket}) => {
    if(bracket.round === "Champion") {
      return <Fragment>
      <div className="cell">
        <NewComputeCell actualPlayer={bracket.actualPlayer1 || "No predictions/No results"} />  
      </div>
    </Fragment>
    }

    return <Fragment>
      <div className="cell left">
        <NewComputeCell actualPlayer={bracket.actualPlayer1 || "No predictions/No results"} />
      </div>
      <div className="cell">
        <NewComputeCell actualPlayer={bracket.actualPlayer2 || "No predictions/No results"} />
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
        return <NewBracket bracket={bracket} />
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
  })

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
      </Fragment>
    }
  })

  const dummyPanes = Array(1).fill().map(index => {
    return {
      menuItem: "Event Name",
      render: () => <Fragment>
        <Skeleton  count={10} />
      </Fragment>
    }
  })

  if(!data.name) {
    return <Fragment>            
      <div className="ui container" key={data.name}>      
      <div className="header-edit">
      <Skeleton  count={1} width="200px" height="25px" />  
      </div>
      <div className="column"> 
        <Tab panes={dummyPanes} />
      </div>
    </div>
  </Fragment>

  }

  console.log("brackets", brackets)
  
  return <Fragment>
    <SemanticToastContainer />
    <div className="ui container" key={data.name}>
      <div className="header-edit">
        <h2 className="ui aligned header">{data.name}</h2> 
        
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
      <div className="column">        
        {panes.length > 0 && <Tab panes={panes} />}
      </div>
    </div>
  </Fragment>
};
