import React from "react";
import { BrowserRouter as Router, Route, Link, Switch, Redirect } from "react-router-dom";
import axios from "axios";

import conf from "./config";
import "./App.css";
import setAuthToken from "./set-auth-token";

import Landing from "./components/landing";
import LoginMiddle from "./components/login-middle";
import SelectContest from "./components/select-contest";
import ContestPage from "./components/contest-page";
import ProblemPage from "./components/problem-page";

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoggedIn: false,
		}
		this.handleLogin = this.handleLogin.bind(this);
	}

	componentWillMount() {
		if (localStorage && localStorage.accessToken) {
			// TODO: check expiry
			this.setState({
				isLoggedIn: true,
			});
			setAuthToken(localStorage.accessToken);
		} else {
			this.setState({
				isLoggedIn: false,
			});
			if (localStorage) {
				localStorage.removeItem("accessToken");
				localStorage.removeItem("refreshToken");
				localStorage.removeItem("tokenType");
				localStorage.removeItem("expiresIn");
				localStorage.removeItem("loginTimeStamp");
				localStorage.removeItem("user");
			}
		}
	}

	handleLogin(data, user) {
		setAuthToken(data.token_type + " " + data.access_token);
		this.setState({
			isLoggedIn: true
		});
		localStorage.setItem("accessToken", data.token_type + " " + data.access_token);
		localStorage.setItem("refreshToken", data.refresh_token);
		localStorage.setItem("tokenType", data.token_type);
		localStorage.setItem("expiresIn", data.expires_in);
		localStorage.setItem("loginTimeStamp", Date.now());
		localStorage.setItem("user", JSON.stringify(user));
	}

	render() {
		return (
			<Router>
				<Route exact path="/" component={Landing}/>
				<Route exact path="/auth/login/middle" render={
					(props) => <LoginMiddle {...props} callBack={this.handleLogin} />}/>

				<Route exact path="/start" component={SelectContest} />
				<Route exact path="/contest" component={ContestPage} />
				<Route exact path="/problem" component={ProblemPage} />
			</Router>
		);
	}
}

export default App;