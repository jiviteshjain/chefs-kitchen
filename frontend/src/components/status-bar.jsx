import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import axios from 'axios';

export default class StatusBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: null
        }
    }

    componentDidMount() {
        if (localStorage && localStorage.user) {
            const user = JSON.parse(localStorage.user);
            this.setState({
                username: user.username
            });
        }
    }
    
    render() {
        return (
            <div className="container status-bar">
                <div className="row">
                    <div className="col-12 d-flex justify-content-end">
                        <p className="mr-3">Hi {this.state.username}</p>
                        <Link to="/auth/logout"><b>LOGOUT</b></Link>
                    </div>
                </div>
            </div>
        );
    }
}