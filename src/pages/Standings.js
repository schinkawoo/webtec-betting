/**
 * Created by nes on 30/06/16.
 */
import React from "react"
import {connect} from "react-redux"
import {browserHistory} from 'react-router';
import store from '../store/index'
import * as actions from '../actions'
import * as util from "../util"

class Standings extends React.Component {
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

    handleRowClick = (person) => {
        browserHistory.push("/" + person);
    };

    evaluatePrediction(item) {
        const {display} = this.props;
        switch (item.type){
            case "match":
                return display.matches ? this.evaluateMatchPrediction(item.prediction, item.match.id) : 0;
            case "red_cards":
                return display.redCards ? this.evaluateRedCardPrediction(item.prediction) : 0;
            case "goals":
                return display.goals ? this.evaluateGoalsPrediction(item.prediction.player, item.priority) : 0;
        }
        return 0;
    }

    evaluateMatchPrediction(prediction, matchId) {
        var match = this.props.matches[matchId];
        const {display} = this.props;
        if (match) {
            if(display.group && match.phase == "group"){
                return util.evaluateGroupMatchPrediction(prediction, match);
            } else if(display.knockout && match.phase == "knockout"){
                return util.evaluateKnockoutMatchPrediction(prediction, match);
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    }

    evaluateRedCardPrediction(redCardPrediction) {
        const {display} = this.props;
        const {matches} = this.props;
        return Object.keys(matches).reduce((result, matchId) => {
            if(display.group && matches[matchId].phase == "group" || display.knockout && matches[matchId].phase == "knockout") {
                return result + matches[matchId].red_cards.reduce((result, redTeam) => {
                        return result + (redCardPrediction == redTeam ? 5 : 0);
                    }, 0);
            } else {
                return result + 0;
            }
        }, 0);
    }

    evaluateGoalsPrediction(goalscorerPrediction, predictionPriority) {
        const {display} = this.props;
        var points = 0;
        var pointsPerGoal = 4 - parseInt(predictionPriority);
        const {matches} = this.props;
        Object.keys(matches).forEach((matchId) => {
            if(display.group && matches[matchId].phase == "group" || display.knockout && matches[matchId].phase == "knockout")
                matches[matchId].goals.forEach((goal) => {
                    points+= goal.includes(goalscorerPrediction) ? pointsPerGoal : 0;
                })
        });
        return points;
    }

    getEvaluatedPredictions() {
        const evaluatedPredictions = {}
        const {predictions} = this.props;

        Object.keys(predictions).forEach((userName) =>{
            var userPoints = 0;
            var userPredictions = predictions[userName];
            userPredictions.forEach((userPrediction) => {
                userPoints += this.evaluatePrediction(userPrediction);
            });
            evaluatedPredictions[userName] = userPoints;
        });
        return evaluatedPredictions;
    }

    getStandings() {
        var standings = {};
        var evaluatedPredictions = this.getEvaluatedPredictions();
        Object.keys(evaluatedPredictions).forEach((name) => {
            standings[name] =  {
            "title": name,
            "points": evaluatedPredictions[name]
        }
        });

        return Object.keys(standings).map((key)=>standings[key]);
    }

    toggleCheckbox(type) {
        const {display} = this.props;
        // console.log(type)
        store.dispatch(actions.updateDisplay({[type]:!display[type]}))
    }

    render() {
        var standings = this.getStandings();
        standings.sort((e1, e2)=>{return e2.points - e1.points})

        var displayStandings = standings.map((result, index)=>{
            return(
                <tr key={index} onClick={this.handleRowClick.bind(this, result.title)} style={{cursor: "pointer"}}>
                    <td><strong>{index + 1}.</strong> {result.title.toUpperCase()}</td><td >{result.points}</td>
                </tr>
            )
        });

        const {display} = this.props;

        return (
            <div>
                <h1>Standings</h1>
                <div>
                    <div class="checkbox-inline"><label><h4>Phase</h4></label></div>
                    <div class="checkbox-inline">
                        <input type="checkbox" value=""
                                  checked={display.group}
                                  onChange={this.toggleCheckbox.bind(this, "group")}/>
                        <label>Group</label>
                    </div>
                    <div class="checkbox-inline">
                        <input type="checkbox" value=""
                               checked={display.knockout}
                               onChange={this.toggleCheckbox.bind(this, "knockout")}/>
                        <label>Knockout</label>
                    </div>
                </div>
                <div>
                    <div class="checkbox-inline"><label><h4>Type</h4></label></div>
                    <div class="checkbox-inline">
                        <input type="checkbox" value=""
                               checked={display.matches}
                               onChange={this.toggleCheckbox.bind(this, "matches")}/>
                        <label>Matches</label>
                    </div>
                    <div class="checkbox-inline" >
                        <input type="checkbox" value=""
                               checked={display.goals}
                               onChange={this.toggleCheckbox.bind(this, "goals")}/>
                        <label>Goals</label>
                    </div>
                    <div class="checkbox-inline" >
                        <input type="checkbox" value=""
                               checked={display.redCards}
                               onChange={this.toggleCheckbox.bind(this, "redCards")}/>
                        <label>Red Cards</label>
                    </div>
                </div>
                <table className="table table-hover">
                    <thead>
                    <tr>
                        <th>Betting Kings</th>
                        <th>Points</th>
                    </tr>
                    </thead>
                    <tbody>
                        {displayStandings}
                    </tbody>
                </table>
            </div>
        )
    }
}

const StandingsContainer = connect((state)=>{
    return {
        matches: state.matches,
        predictions: state.predictions,
        display: state.display
    }
})(Standings);

export default StandingsContainer;