/**
 * Created by nes on 29/06/16.
 */
import axios from "axios"
import store from '../store/index'

export function loadMatches() {
    return {
        type: "LOAD_MATCHES",
        payload: axios.get("https://amateur-betting-server.herokuapp.com/matches/").then((response) =>{
            store.dispatch(storeMatchesWithResult(response.data.filter(match => match.result)));
            store.dispatch(getSportApiMatches(response.data.filter(match => !match.result).map(match => match.id)));
        })
    }
}

export function loadPredictions() {
    return {
        type: "LOAD_PREDICTIONS",
        payload: axios.get("https://amateur-betting-server.herokuapp.com/predictions/")
    }
}

function storeMatchesWithResult(matches) {
    return {
        type: "STORE_MATCHES_WITH_RESULT",
        payload: matches
    }
}

function getSportApiMatches(matchIds=[]) {
    return {
        type: "LOAD_SPORT_API_MATCHES",
        payload: axios.get("http://api.sport.blick.ch/match/" + matchIds.join(","))
    }
}