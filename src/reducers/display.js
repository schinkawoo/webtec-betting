/**
 * Created by nes on 30/06/16.
 */

function update(state={}, action) {
    switch (action.type) {
        case "UPDATE_DISPLAY":
            return Object.assign({}, state, action.payload);
        case "RESET_DISPLAY":
            return Object.assign({}, action.payload);
        default:
            return state;
    }
}

module.exports = update;