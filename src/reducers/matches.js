/**
 * Created by nes on 29/06/16.
 */

import * as util from "../util"

function update(state={}, action) {
    switch (action.type) {
        case "LOAD_SPORT_API_MATCHES_FULFILLED":
            return Object.assign({}, state, action.payload.data.map((match) => {
                const scores = match.scores.length > 0 ? match.scores.filter(score => score.type == "current")[0].values : [];
                const result = {}
                result[util.translateTeamNameToEnglish(match.opponentsData[0].opponent.name)] = scores.length > 0 ? scores[0] : "";
                result[util.translateTeamNameToEnglish(match.opponentsData[1].opponent.name)] = scores.length > 0 ? scores[1] : "";

                return {
                    id:match.id,
                    phase: isNaN(match.round) ? "knockout" : "group",
                    result: result,
                    round: match.round,
                    date: parseDate(match.date),
                    red_cards: filterRedCards(match.events),
                    status: transformMatchStatus(match),
                    goals: match.events.filter(event => event.subtype == "goal").map(event => event.player.name)
                }
            }).reduce((object, value) => {
                object[value.id] = value;
                return object;
            }, {}));
        case "STORE_MATCHES_WITH_RESULT":
            return Object.assign({}, state, action.payload);
        default:
            return state;
    }
}

function parseDate(dateString) {
    var dateSplits = dateString.split(/[-T.]/);
    return new Date( dateSplits.slice(0,3).join('/')+' '+dateSplits[3] );
}

function transformMatchStatus(match) {
    var nowDate = Date.now();
    var matchStart = parseDate(match.date);
    if(matchStart > nowDate) {
        return "NOT_STARTED";
    } else if(match.status == "AFTER_PENALTY" || match.status == "AFTER_EXTRA_TIME" || match.status == "ENDED") {
        return "ENDED";
    } else {
        return "RUNNING";
    }
}

function filterRedCards(events) {
    return events.filter((event) => {
        return event.subtype == "card" && event.card_type.includes("RED");
    }).map(event => util.translateTeamNameToEnglish(event.team.name));
}

module.exports = update;