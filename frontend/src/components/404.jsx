import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import conf from "../config";
import ErrorImg from "../assets/404.svg";

export default class NotFound extends React.Component {
    render() {
        return (
            <div className="container full-height">
                <div className="row h-100">
                    <div className="col-12 h-100 d-flex flex-column justify-content-center align-items-center">
                        <h3>That's the wrong recipe!</h3>
                        <img src={ErrorImg} height="200" className="img my-5" />
                        <p className="text-center text-muted small">
                            This page does not exist.<br />
                            You may want to <Link to="/" className="inline-link">go home</Link>.
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}