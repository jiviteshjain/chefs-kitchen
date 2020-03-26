import React from "react";
import { BrowserRouter as Router, Route, Link, Switch, Redirect } from "react-router-dom";
import axios from "axios";

import conf from "./config";
import "./App.css";

import Landing from "./components/landing";
import LoginMiddle from "./components/login-middle";

function App() {
	return (
		<Router>
			<Route exact path="/" component={Landing}/>
			<Route exact path="/auth/login/middle" component={LoginMiddle}/>
		</Router>
	);
}

export default App;