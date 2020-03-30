import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import axios from "axios";
import queryString from "query-string";

import conf from "../config";
import LoadingImg from "../assets/login-loading.svg";

export default class LoginMiddle extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isError: false,
        }

        this.handleButtonClick = this.handleButtonClick.bind(this);
    }

    componentDidMount() {
        const params = queryString.parse(this.props.location.search);
        if (params.state !== conf.CHEF_STATE) {
            this.setState({
                isError:true,
            });
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
            const reqdPerms = ["private", "public", "submission"];
            const givenPerms = response.data.result.data.scope.split(" ");
            for (let perm of reqdPerms) {
                if (!perm in givenPerms) {
                    this.setState({
                        isError: true,
                    });
                    return;
                }
            }
            const loginData = response.data.result.data;
            axios({
                method: "GET",
                url:  "/api/users/me",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + loginData.access_token,
                    // only place where manual header is required
                },
            }).then((response) => {
                console.log(response.data);
                this.props.callBack(loginData, response.data.result.data.content);
                this.props.history.push("/start");
            }).catch((error) => {
                if (error) {
                  this.setState({
                    isError: true
                  });
                  console.log(error);
                  if (error.response) {
                    console.log(error.response.data);
                  }
                }
            });
            // this.props.history.push("/dashboard");
        }).catch((error) => {
            if (error) {
                this.setState({
                    isError: true,
                });
                console.log(error);
                if (error.response) {
                    console.log(error.response.data);
                }
            }

        });
    }

    handleButtonClick(e) {
        e.preventDefault();
        this.props.history.push("/");
    }

    render() {
        return (
            <React.Fragment>
                <div className="container full-height">
                    <div className="row h-100">
                        <div className="col-12 h-100 d-flex flex-column justify-content-center align-items-center">
                            <h3>Borrowing recipes from the Chef...</h3>
                            <img src={LoadingImg} height="200" className="img my-5" />
                            <p className="text-center text-muted small">
                                We are verifying your credentials.<br />
                            You will be redirected to your home page shortly.
                        </p>
                        </div>
                    </div>
                </div>
                {
                    this.state.isError &&
                    <div className="alert alert-danger bg-rust alert-pos shadow-move" role="alert">
                        <h4 className="alert-heading">Uh oh!</h4>
                        <p>Something went wrong while logging you in! It's not you, it's us, and while we try to figure out what's going on, we'll redirect you back so you can try again.</p>
                        <hr />
                        <div className="mb-0 d-flex justify-content-end">
                            <button className="btn shadow-move bg-lavender" onClick={this.handleButtonClick}>Try Again</button>
                        </div>
                    </div>
                }
            </React.Fragment>
            
        );
    }
}