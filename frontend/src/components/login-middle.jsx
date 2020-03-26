import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import axios from "axios";
import queryString from "query-string";

import conf from "../config";
import LoadingImg from "../assets/login-loading.svg";

export default class LoginMiddle extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const params = queryString.parse(this.props.location.search);
        if (params.state !== conf.CHEF_STATE) {
            this.props.history.push("/");
            return;
        }
        console.log(params.code);
        axios({
            method: "POST",
            url: "/api/auth/login/middle",
            headers: {
                "Content-Type": "application/json",
            },
            data: {
                "code": params.code
            },
        }).then((response) => {
            console.log(response.data);
            // this.props.callback(response.data.token);
            // this.props.history.push("/dashboard");
        }).catch((error) => {
            if (error) {
                console.log(error);
                if (error.response) {
                    console.log(error.response.data);
                }
            }

        });
    }

    render() {
        return (
            <div className="container full-height">
                <div className="row h-100">
                    <div className="col-12 h-100 d-flex flex-column justify-content-center align-items-center">
                        <h3>Borrowing recipes from the Chef...</h3>
                        <img src={LoadingImg} height="200" className="img my-5"/>
                        <p className="text-center text-muted small">
                            We are verifying your credentials.<br/>
                            You will be redirected to your home page shortly.
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}