/**
 * Created by nes on 29/06/16.
 */

import * as util from "../util"

function update(state=[], action) {
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
                    date: match.date,
                    red_cards: match.events.filter(event => event.subtype == "card" && event.card_type.includes("RED")).map(event => event.team.name),
                    goals: match.events.filter(event => event.subtype == "goal")
                }
            }));
        case "STORE_MATCHES_WITH_RESULT":
            return Object.assign({}, state, action.payload);
        default:
            return state;
    }
}

module.exports = update;