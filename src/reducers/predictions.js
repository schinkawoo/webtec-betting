/**
 * Created by nes on 29/06/16.
 */

function update(state=[], action) {
    switch (action.type) {
        case "LOAD_PREDICTIONS_FULFILLED":
            return Object.assign({}, state, action.payload.data);
        default:
            return state;
    }
}

module.exports = update;