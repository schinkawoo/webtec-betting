/**
 * Created by nes on 30/06/16.
 */
import React from "react"
import {connect} from "react-redux"
import store from '../store/index'
import * as actions from '../actions'
import MatchRow from "../components/MatchRow"

export default class Details extends React.Component {
    constructor() {
        super();
        store.dispatch(actions.resetDisplay({
            matches:true,
            goals:true,
            redCards:true,
            group:true,
            knockout:true
        }));
    }

    getMatchRows(phase="") {
        var {predictions} = this.props;
        var {matches} = this.props;
        var {prophet} = this.props.params;

        if(!predictions[prophet])
            return []

        return predictions[prophet].map((matchPrediction, index)=> {
            if (matchPrediction.type == "match") {
                var match = matches[matchPrediction.match.id];
                if(!phase || (match && phase == match.phase)) {
                    return (
                        <MatchRow key={index} match={match} matchPrediction={matchPrediction} phase={phase}/>
                    )
                }
            }
        });
    }

    getOtherRows() {
        var {predictions} = this.props;
        var {prophet} = this.props.params;

        if(!predictions[prophet])
            return []

        var finalResult =  predictions[prophet].map((predictionItem, index)=>{
                if(predictionItem.type == "red_cards") {
                    var points = this.evaluateRedCardPrediction(predictionItem.prediction);
                    return (
                        <tr key={index}>
                            <td><strong>Red Cards</strong></td>
                            <td>{predictionItem.prediction}</td>
                            <td>{points/5}</td>
                            <td>{points}</td>
                        </tr>
                    )
                } else if(predictionItem.type == "goals") {
                    var points = this.evaluateGoalsPrediction(predictionItem.prediction.player, predictionItem.priority);
                    return  (
                        <tr key={index}>
                            <td><strong>Goals</strong></td>
                            <td>{predictionItem.prediction.player} ({predictionItem.prediction.team})</td>
                            <td>{(points)/(4 - parseInt(predictionItem.priority))}</td>
                            <td>{points}</td>
                        </tr>
                    )
                }
            }).filter(elem => elem);
        return finalResult
    }

    evaluateRedCardPrediction(redCardPrediction) {
        const {matches} = this.props;
        return Object.keys(matches).reduce((result, matchId) => {
            return result + matches[matchId].red_cards.reduce((result, redTeam) => {
                    return result + (redCardPrediction == redTeam ? 5 : 0);
                }, 0);
        }, 0);
    }

    evaluateGoalsPrediction(goalscorerPrediction, predictionPriority) {
        var points = 0;
        var pointsPerGoal = 4 - parseInt(predictionPriority);
        const {matches} = this.props;
        Object.keys(matches).forEach((matchId) => {
            matches[matchId].goals.forEach((goal) => {
                points+= goal.includes(goalscorerPrediction) ? pointsPerGoal : 0;
            })
        });
        return points;
    }

    render() {
        const {prophet} = this.props.params;

        var groupMatchesRows = this.getMatchRows("group");
        var knockoutMatchesRows = this.getMatchRows("knockout");
        var otherDetailsRows = this.getOtherRows();
        return (
            <div>
                <h1>Details</h1>
                <div>
                    <h4>Knockout Match Predictions (<span style={{textTransform: "capitalize"}}>{prophet}</span>)</h4>
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <td>Match</td>
                                <td>Result</td>
                                <td>Prediction</td>
                                <td>Date</td>
                                <td>Round</td>
                            </tr>
                        </thead>
                        <tbody>
                            {knockoutMatchesRows.reverse()}
                        </tbody>
                    </table>
                </div>
                <div style={{paddingTop: "10px"}}>
                    <h4>Goal/Card Predictions (<span style={{textTransform: "capitalize"}}>{prophet}</span>)</h4>
                    <table className="table table-hover">
                        <thead>
                        <tr>
                            <td>Type</td>
                            <td>Prediction</td>
                            <td>Hits</td>
                            <td>Points</td>
                        </tr>
                        </thead>
                        <tbody>
                            {otherDetailsRows}
                        </tbody>
                    </table>
                </div>
                <div>
                    <h4>Group Match Predictions (<span style={{textTransform: "capitalize"}}>{prophet}</span>)</h4>
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <td>Match</td>
                                <td>Result</td>
                                <td>Prediction</td>
                                <td>Date</td>
                                <td>Round</td>
                            </tr>
                        </thead>
                        <tbody>
                            {groupMatchesRows.reverse()}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}

const DetailsContainer = connect((state)=>{
    return {
        matches: state.matches,
        predictions: state.predictions,
        display: state.display
    }
})(Details);

export default DetailsContainer;



