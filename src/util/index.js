/**
 * Created by nes on 29/06/16.
 */

export function translateTeamNameToEnglish(teamNameInGerman){
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

export function evaluateKnockoutMatchPrediction(matchPrediction, match) {
    if(match.date < Date.now()) {
        var basePoints = 0;
        const teams = Object.keys(match.result);
        var score_1 = parseInt(match.result[teams[0]]);
        var score_2 = parseInt(match.result[teams[1]]);

        if(score_1 > score_2){
            basePoints = teams[0] == matchPrediction ? 1 : 0;
        } else if(score_1 < score_2){
            basePoints = teams[1] == matchPrediction ? 1 : 0;
        }

        switch (match.round){
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

export function evaluateGroupMatchPrediction(matchPrediction, match) {
    if(match.date < Date.now()) {
        const teams = Object.keys(match.result);
        var score_1 = parseInt(match.result[teams[0]]);
        var score_2 = parseInt(match.result[teams[1]]);

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
    } else {
        return 0;
    }
}