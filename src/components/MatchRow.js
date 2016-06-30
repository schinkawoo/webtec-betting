/**
 * Created by nes on 30/06/16.
 */

import React from "react"
import * as util from "../util"

export default class MatchRow extends React.Component {
    goToMatch(matchUrl){
        window.open(matchUrl, "_blank");
    }

    evaluateMatchPrediction(prediction, match) {
        if (match) {
            if(match.phase == "group"){
                return util.evaluateGroupMatchPrediction(prediction, match);
            } else if(match.phase == "knockout"){
                return util.evaluateKnockoutMatchPrediction(prediction, match);
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    }
    
    render () {
        var {match} = this.props;
        var {matchPrediction} = this.props;

        switch (match.status) {
            case "NOT_STARTED":
                var rowClass = "";
                break;
            case "RUNNING":
                var rowClass = "info";
                break;
            case "ENDED":
                var rowClass = this.evaluateMatchPrediction(matchPrediction.prediction, match) > 0 ? "success" : "danger";
        }
        var matchUrl = "http://www.blick.ch/id" + matchPrediction.match.esc_id + ".html";
        var teams = Object.keys(match.result);
        return (
            <tr class={rowClass} onClick={this.goToMatch.bind(this, matchUrl)}
                style={{cursor: "pointer"}}>
                <td>{teams[0]} - {teams[1]}</td>
                <td>{matchPrediction.score}</td>
                <td>{matchPrediction.prediction == "DRAW" ? "DRAW" : matchPrediction.match[matchPrediction.prediction]}</td>
                <td>{matchPrediction.start}</td>
                <td>{match.round}</td>
            </tr>
        )
    }
}