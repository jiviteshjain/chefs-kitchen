import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import axios from "axios";
import conf from "../config";

export default class Landing extends React.Component {
    render() {
        const LOGIN_URL = conf.CHEF_BASE_URL + "/oauth/authorize" + "?response_type=code&client_id=" + conf.CHEF_CLIENT_ID + "&state=" + conf.CHEF_STATE + "&redirect_uri=" + conf.FRONT_BASE_URL + "/auth/login/middle";
        return (
            <React.Fragment>
                <div className="container-fluid home-screen d-flex flex-column">
                    <div className="row flex-grow-1 home-screen-main">
                        <div className="col-12 d-flex flex-column justify-content-center align-items-center">
                            <h1>The</h1>
                            <h1>Chef's</h1>
                            <h1>Kitchen</h1>
                        </div>
                    </div>
                    <div className="row flex-grow-0 mb-5">
                        <div className="col-12 d-flex flex-column justify-content-center align-items-center">
                            <h4>A CodeChef Contest Arena</h4>
                            <a href={LOGIN_URL} className="btn shadow-move line-blue">Get Started</a>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
};