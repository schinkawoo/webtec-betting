import React from 'react';
import ReactDOM from "react-dom"
import {Router, Route, IndexRoute, browserHistory} from "react-router"

import Layout from "./components/Layout"
import Standings from "./pages/Standings"

const content = document.getElementById('root');

ReactDOM.render(
    <Router history={browserHistory}>
        <Route path="/" component={Layout}>
            <IndexRoute component={Standings}></IndexRoute>
            <Route path="standings(/:prophet)" name="standings" component={Standings}></Route>
        </Route>
    </Router>,
    content
);