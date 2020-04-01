import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import conf from "../config";
import LoadingImg from "../assets/loading.svg";

export default class Loading extends React.Component {
    render() {
        return (
            <div className="container full-height">
                <div className="row h-100">
                    <div className="col-12 h-100 d-flex flex-column justify-content-center align-items-center">
                        <h3>Food is almost ready...</h3>
                        <img src={LoadingImg} height="200" className="img my-5" />
                        <p className="text-center text-muted small">
                            Please wait while we load this page.<br />
                            If this is taking way too long, try <a onClick={e => window.location.reload()} className="inline-link">refreshing the page</a> or <Link to="/auth/logout" className="inline-link">logging out</Link> and back in.
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}