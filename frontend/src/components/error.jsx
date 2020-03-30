import React from "react";

import conf from "../config";
import ErrorImg from "../assets/error.svg";

export default class Error extends React.Component {
    render() {
        return (
            <div className="container full-height">
                <div className="row h-100">
                    <div className="col-12 h-100 d-flex flex-column justify-content-center align-items-center">
                        <h3>Uh Oh! We smell smoke :(</h3>
                        <img src={ErrorImg} height="200" className="img my-5" />
                        <p className="text-center text-muted small">
                            Looks like something is wrong.<br />
                            Try refreshing the page or logging out and back in.
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}