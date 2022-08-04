
import React, { Fragment } from "react";
import { useState } from "react";
import { useParams } from 'react-router-dom';
import { useExternalApi } from "../utils/requests";
import { useAuth0 } from "@auth0/auth0-react";
import { Icon, Input, Tab } from 'semantic-ui-react'

const computeClass = (player, actualPlayer) => {
    if (actualPlayer === null) {
        return "none"
    }
    if (actualPlayer === player) {
        return "correct"
    }
    return "incorrect"
}

const NewComputeCell = ({ player, actualPlayer }) => {
    if (actualPlayer === null) {
        return <Fragment><p>{player}</p></Fragment>
    }

    if (player === null) {
        return <Fragment><p>{actualPlayer}</p></Fragment>
    }

    if (player === actualPlayer) {
        return <Fragment><p>{player}</p></Fragment>
    } else {
        return <Fragment><p><strike>{player}</strike></p><p>{actualPlayer}</p></Fragment>
    }
}


export const NewBracket = ({ bracket, brackets }) => {
    const player1 = (brackets[bracket.id] || {}).player1
    const actualPlayer1 = (brackets[bracket.id] || {}).actualPlayer1
    const player2 = (brackets[bracket.id] || {}).player2
    const actualPlayer2 = (brackets[bracket.id] || {}).actualPlayer2

    if (!actualPlayer1 && !actualPlayer2 && !player1 && !player2) {
        if (bracket.round === "Champion") {
            return <Fragment>
                <div className="cell">
                    <p>No predictions/No results</p>
                </div>
            </Fragment>
        }

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

    if (bracket.round === "Champion") {
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

export const NewUnauthenticatedBracket = ({ bracket }) => {
    if (bracket.round === "Champion") {
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
        <div className="cell right">
            <NewComputeCell actualPlayer={bracket.actualPlayer2 || "No predictions/No results"} />
        </div>
    </Fragment>
}