import React from "react"
import $ from "jquery"
import {browserHistory} from 'react-router';

export default class HomePage extends React.Component {
    constructor() {
        super();
        this.state = {
            groupMatches: [],
            knockoutsMatches: [],
            groupPredictions:{},
            knockoutsPredictions:{},
            detailsTarget:"loading",
        };
    }

    getJsonData(url) {
        var result = {
            "error": "Data is not available"
        };

        $.ajax({
            url: url,
            async: false,
            dataType: 'json',
            success: function (data) {
                result = data;
            }
        });
        return result;
    }

    getAllMatchIds(phase) {
        var serverUrl = "https://amateur-betting-server.herokuapp.com/";
        var matches = this.getJsonData(serverUrl + phase + "/matches/")
        return matches.map((match) => match.id);
    }

    componentWillUnMount(){
        this.mounted = false;
    }


    componentDidMount() {
        this.mounted = true;
        var serverUrl = "https://amateur-betting-server.herokuapp.com/";
        this.state.groupPredictions = this.getJsonData(serverUrl + "group-phase/predictions/");
        this.state.groupMatches = this.getJsonData("http://api.sport.blick.ch/match/" + this.getAllMatchIds("group-phase").join(",")).reduce((object, value) => {
            object[value.id] = value;
            return object;
        }, {});

        this.state.knockoutsPredictions = this.getJsonData(serverUrl + "knockout-phase/predictions/");
        this.state.knockoutsMatches = this.getJsonData("http://api.sport.blick.ch/match/" + this.getAllMatchIds("knockout-phase").join(",")).reduce((object, value) => {
            object[value.id] = value;
            return object;
        }, {});
        this.evaluateGroupPredictions();
        this.evaluateKnockoutPredictions();
        this.state.detailsTarget = this.props.params.prophet;
        this.setState(this.state);
    }

    evaluateKnockoutPredictions() {
        Object.keys(this.state.knockoutsPredictions).forEach((userName) =>{
            this.state.knockoutsPredictions[userName].forEach((item) => {
                item.points = this.evaluateKnockoutMatchPrediction(this.state.knockoutsMatches[item.match.id], item.prediction);
                item.score = this.getMatchScore(this.state.knockoutsMatches[item.match.id]);
                item.start = this.formatDate(this.state.knockoutsMatches[item.match.id].date);
                item.status = this.getMatchStatus(this.state.knockoutsMatches[item.match.id]);
            });
        });
    }

    evaluateGroupPredictions() {
        Object.keys(this.state.groupPredictions).forEach((userName) =>{
            var groupPredictions = this.state.groupPredictions[userName];
            groupPredictions.forEach((item) => {
                switch (item.type){
                    case "match":
                        item.points = this.evaluateGroupMatchPrediction(this.state.groupMatches[item.match.id], item.prediction);
                        item.score = this.getMatchScore(this.state.groupMatches[item.match.id]);
                        item.start = this.formatDate(this.state.groupMatches[item.match.id].date);
                        item.status = this.getMatchStatus(this.state.groupMatches[item.match.id]);
                        break;
                    case "red_cards":
                        item.points = this.evaluateRedCardPrediction(item.prediction);
                        break;
                    case "goals":
                        item.points = this.evaluateGoalsPrediction(item.prediction.player, item.priority);
                        break;
                }
            })
        });
    }

    evaluateKnockoutMatchPrediction(restMatch, matchPrediction) {
        if(this.parseFuckingDateForApple(restMatch.date) < Date.now() && restMatch.scores.length > 0) {
            var basePoints = restMatch.scores.filter((restScore) => restScore.type=="current").reduce((previous, current) => {
                var score_1 = parseInt(current.values[0]);
                var score_2 = parseInt(current.values[1]);

                if(score_1 > score_2){
                    var winnerIndex = 0;
                } else if(score_1 < score_2){
                    var winnerIndex = 1;
                } else {
                    return 0;
                }

                return this.translateTeamNameToEnglish(restMatch.opponentsData[winnerIndex].opponent.name) == matchPrediction;
            }, "");

            switch (restMatch.round){
                case "Finale":
                    return 5 * basePoints;
                case "Halbfinale":
                    return 4 * basePoints;
                case "Viertelfinale":
                    return 3 * basePoints;
                case "Achtelfinale":
                    return 2 * basePoints;
            }
        } else {
            return 0;
        }
    }

    evaluateGroupMatchPrediction(restMatch, matchPrediction) {
        if(this.parseFuckingDateForApple(restMatch.date) < Date.now() && restMatch.scores.length > 0) {
            return restMatch.scores.filter((restScore) => restScore.type=="current").reduce((previous, current) => {
                var score_1 = parseInt(current.values[0]);
                var score_2 = parseInt(current.values[1]);

                switch (matchPrediction) {
                    case "HOME":
                        return score_1 > score_2 ? 1 : 0;
                    case "AWAY":
                        return score_1 < score_2 ? 1 : 0;
                    case "DRAW":
                        return score_1 == score_2 ? 1 : 0;
                    default:
                        return 0;
                }
            }, "");
        } else {
            return 0;
        }
    }

    evaluateRedCardPrediction(redCardPrediction) {
        var points = 0;
        Object.keys(this.state.groupMatches).forEach((matchId) => {
            this.state.groupMatches[matchId].events.forEach((event) => {
                if(event.subtype == "card" && event.card_type.includes("RED")) {
                    points+= redCardPrediction == this.translateTeamNameToEnglish(event.team.name) ? 5 : 0;
                }
            })
        });

        Object.keys(this.state.knockoutsMatches).forEach((matchId) => {
            this.state.knockoutsMatches[matchId].events.forEach((event) => {
                if(event.subtype == "card" && event.card_type.includes("RED")) {
                    points+= redCardPrediction == this.translateTeamNameToEnglish(event.team.name) ? 5 : 0;
                }
            })
        });

        return points;
    }

    evaluateGoalsPrediction(goalscorerPrediction, predictionPriority) {
        var points = 0;
        var pointsPerGoal = 4 - parseInt(predictionPriority);
        Object.keys(this.state.groupMatches).forEach((matchId) => {
            this.state.groupMatches[matchId].events.forEach((event) => {
                if(event.subtype == "goal") {
                    points+= event.player.name.includes(goalscorerPrediction) ? pointsPerGoal : 0;
                }
            })
        });
        Object.keys(this.state.knockoutsMatches).forEach((matchId) => {
            this.state.knockoutsMatches[matchId].events.forEach((event) => {
                if(event.subtype == "goal") {
                    points+= event.player.name.includes(goalscorerPrediction) ? pointsPerGoal : 0;
                }
            })
        })
        return points;
    }

    translateTeamNameToEnglish(teamNameInGerman){
        switch (teamNameInGerman) {
            case "Frankreich":
                return "France";
            case "Rumänien":
                return "Romania";
            case "Albanien":
                return "Albania";
            case "Schweiz":
                return "Switzerland";
            case "Wales":
                return "Wales";
            case "Slowakei":
                return "Slovakia";
            case "England":
                return "England";
            case "Russland":
                return "Russia";
            case "Türkei":
                return "Turkey";
            case "Kroatien":
                return "Croatia";
            case "Polen":
                return "Poland";
            case "Nordirland":
                return "N. Ireland";
            case "Deutschland":
                return "Germany";
            case "Ukraine":
                return "Ukraine";
            case "Spanien":
                return "Spain";
            case "Tschechien":
                return "Czech Rep.";
            case "Irland":
                return "R. Ireland";
            case "Schweden":
                return "Sweden";
            case "Belgien":
                return "Belgium";
            case "Italien":
                return "Italy";
            case "Oesterreich":
                return "Austria";
            case "Ungarn":
                return "Hungary";
            case "Portugal":
                return "Portugal";
            case "Island":
                return "Iceland";
            case "Russland":
                return "Russia";
            case "Slowakei":
                return "Slovakia";
            default:
                return teamNameInGerman;
        }
    }

    getMatchScore(restMatch) {
        if(this.parseFuckingDateForApple(restMatch.date) < Date.now() && restMatch.scores.length > 0) {
            return restMatch.scores.filter((restScore) => restScore.type=="current").reduce((previous, current) => {
                return current.values.join(" - ");
            }, "");
        } else {
            return "Not Started";
        }
    }

    getMatchStatus(restMatch) {
        var nowDate = Date.now();
        var matchStart = this.parseFuckingDateForApple(restMatch.date);
        if(matchStart > nowDate) {
            return "NOT_STARTED";
        } else if(restMatch.status == "AFTER_PENALTY" || restMatch.status == "AFTER_EXTRA_TIME" || restMatch.status == "ENDED") {
            return "ENDED";
        } else {
            return "RUNNING";
        }
    }

    formatDate(dateString) {
        var monthNames = [
            "January", "February", "March",
            "April", "May", "June", "July",
            "August", "September", "October",
            "November", "December"
        ];
        var date = this.parseFuckingDateForApple(dateString);
        var time = date.getHours()  +':'+ ('0'+date.getMinutes()).slice(-2);
        return date.getDate() +' '+ monthNames[date.getMonth()] +' '+ date.getFullYear() +' ' + time;
    }

    handleRowClick = (person) => {
        if(this.mounted){
            browserHistory.push("/" + person)
        }
    };

    goToMatch(matchUrl){
        window.open(matchUrl, "_blank");
    }

    parseFuckingDateForApple(dateString) {
        var dateSplits = dateString.split(/[-T.]/);
        return new Date( dateSplits.slice(0,3).join('/')+' '+dateSplits[3] );
    }

    render() {
        var displayTarget = this.state.detailsTarget == "loading" ? this.state.detailsTarget : this.props.params.prophet;
        var hideTableClass = displayTarget ? {display:"none"} : {};
        var hideDetailsClass = displayTarget && displayTarget != "loading" ? {} : {display:"none"};
        var hideLoading = displayTarget == "loading" ? {} : {display:"none"};
        var results = {};

        Object.keys(this.state.groupPredictions).forEach((userName) => {
            results[userName] =  {
                "title": userName,
                "points": this.state.groupPredictions[userName].reduce((previous, current)=> {
                    return previous + current.points;
                }, 0)
            }
        });

        Object.keys(this.state.knockoutsPredictions).forEach((userName) => {
            results[userName].points += this.state.knockoutsPredictions[userName].reduce((previous, current)=> {
                return previous + current.points;
            }, 0);
        });
        var resultArray = Object.keys(results).map((key)=>results[key]);
        resultArray.sort((e1, e2)=>{return e2.points - e1.points})

        var displayResutls = resultArray.map((result, index)=>{
            return(
                <tr key={index} onClick={this.handleRowClick.bind(this, result.title)} style={{cursor: "pointer"}}>
                    <td><strong>{index + 1}.</strong> {result.title.toUpperCase()}</td><td >{result.points}</td>
                </tr>
            )
        });

        if(displayTarget && displayTarget != "loading") {
            var displayMatchesDetails = this.state.groupPredictions[displayTarget].map((matchPrediction, index)=>{
                if(matchPrediction.type == "match") {
                    switch (matchPrediction.status){
                        case "NOT_STARTED":
                            var rowClass = "";
                            break;
                        case "RUNNING":
                            var rowClass = "info";
                            break;
                        case "ENDED":
                           var rowClass = matchPrediction.points > 0 ? "success" : "danger";
                    }
                    var matchUrl = "http://www.blick.ch/id" + matchPrediction.match.esc_id + ".html";
                    return (
                        <tr key={index} class={rowClass} onClick={this.goToMatch.bind(this, matchUrl)} style={{cursor: "pointer"}}>
                            <td>{matchPrediction.match.HOME} - {matchPrediction.match.AWAY}</td>
                            <td>{matchPrediction.score}</td>
                            <td>{matchPrediction.prediction == "DRAW" ? "DRAW" : matchPrediction.match[matchPrediction.prediction]}</td>
                            <td>{matchPrediction.start}</td>
                        </tr>
                    )
                }
            });

            var displayKnockoutMatchesDetails = this.state.knockoutsPredictions[displayTarget].map((matchPrediction, index)=>{
                if(matchPrediction.type == "match") {
                    switch (matchPrediction.status){
                        case "NOT_STARTED":
                            var rowClass = "";
                            break;
                        case "RUNNING":
                            var rowClass = "info";
                            break;
                        case "ENDED":
                            var rowClass = matchPrediction.points > 0 ? "success" : "danger";
                    }
                    var matchUrl = "http://www.blick.ch/id" + matchPrediction.match.esc_id + ".html";
                    return (
                        <tr key={index} class={rowClass} onClick={this.goToMatch.bind(this, matchUrl)} style={{cursor: "pointer"}}>
                            <td>{matchPrediction.match.HOME ? matchPrediction.match.HOME : "???"} - {matchPrediction.match.AWAY ? matchPrediction.match.AWAY : "???"}</td>
                            <td>{matchPrediction.score}</td>
                            <td>{matchPrediction.prediction}</td>
                            <td>{matchPrediction.start}</td>
                        </tr>
                    )
                }
            });

            var displayOtherDetails = this.state.groupPredictions[displayTarget].map((predictionItem, index)=>{
                if(predictionItem.type == "red_cards") {
                    return (
                        <tr key={index}>
                            <td><strong>Red Cards</strong></td>
                            <td>{predictionItem.prediction}</td>
                            <td>{predictionItem.points/5}</td>
                            <td>{predictionItem.points}</td>
                        </tr>
                    )
                } else if(predictionItem.type == "goals") {
                    return (
                        <tr key={index}>
                            <td><strong>Goals</strong></td>
                            <td>{predictionItem.prediction.player} ({predictionItem.prediction.team})</td>
                            <td>{(predictionItem.points)/parseInt(4 - predictionItem.priority)}</td>
                            <td>{predictionItem.points}</td>
                        </tr>
                    )
                }
            });
        }
        return (
            <div>
                <div style={hideTableClass}>
                    <h1>Standings</h1>
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th>Betting Kings</th>
                                <th>Points</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayResutls}
                        </tbody>
                    </table>
                </div>
                <div style={hideDetailsClass}>
                    <h1>Standings</h1>
                    <h3 style={{cursor: "pointer"}} onClick={this.handleRowClick.bind(this, "")}>{"<<<"} Back</h3>
                    <div style={{paddingTop: "10px"}}>
                        <h4>Goal/Card Predictions (<span style={{textTransform: "capitalize"}}>{displayTarget}</span>)</h4>
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
                            {displayOtherDetails}
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <h4>Knockout Match Predictions (<span style={{textTransform: "capitalize"}}>{displayTarget}</span>)</h4>
                        <table className="table table-hover">
                            <thead>
                            <tr>
                                <td>Match</td>
                                <td>Result</td>
                                <td>Prediction</td>
                            </tr>
                            </thead>
                            <tbody>
                            {displayKnockoutMatchesDetails}
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <h4>Group Match Predictions (<span style={{textTransform: "capitalize"}}>{displayTarget}</span>)</h4>
                        <table className="table table-hover">
                            <thead>
                            <tr>
                                <td>Match</td>
                                <td>Result</td>
                                <td>Prediction</td>
                            </tr>
                            </thead>
                            <tbody>
                                {displayMatchesDetails}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div style={hideLoading}>
                    <h1>Standings</h1>
                    <h3>Loading. Please wait. Sport Api is taking some time to respond...</h3>
                </div>
            </div>
        );
    }
}
