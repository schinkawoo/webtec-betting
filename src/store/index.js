/**
 * Created by nes on 29/06/16.
 */
import logger from 'redux-logger'
import promise from "redux-promise-middleware"
import * as appReducers from '../reducers'
import {createStore, combineReducers, applyMiddleware} from 'redux'
import {routerReducer} from 'react-router-redux'

const store = createStore(
    combineReducers({
        ...appReducers,
        routing: routerReducer
    }),
    applyMiddleware(logger(), promise())
);


export default store
