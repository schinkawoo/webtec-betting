import React from 'react';
import ReactDOM from "react-dom"
import {Router, Route, IndexRoute, browserHistory} from "react-router"
import {syncHistoryWithStore, routerReducer} from 'react-router-redux'
import {Provider} from 'react-redux'
import * as actions from './actions'
import store from './store/index'

import Layout from "./components/Layout"
import Standings from "./pages/Standings"



const history = syncHistoryWithStore(browserHistory, store);

store.dispatch(actions.loadPredictions());
store.dispatch(actions.loadMatches());

ReactDOM.render(
    <Provider store={store}>
        <Router history={history}>
            <Route path="/" component={Layout}>
                <IndexRoute component={Standings}></IndexRoute>
                <Route path="/(:prophet)" name="details" component={Standings}></Route>
            </Route>
        </Router>
    </Provider>,
    document.getElementById('root')
);

