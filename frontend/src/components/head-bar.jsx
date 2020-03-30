import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import axios from 'axios';

export default class HeadBar extends Component {
    render() {
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 text-center bg-yellow shadow w-100">
                        <Link to="/" className="head">The Chef's Kitchen</Link>
                    </div>
                </div>
            </div>
        )
    }
}