import React from "react";

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
                            If this is taking way too long, try refreshing the page or logging out and back in.
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}