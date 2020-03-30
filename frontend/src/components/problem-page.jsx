import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import axios from "axios";
import queryString from "query-string";
import { DataTable, Column } from 'primereact/datatable';
import Countdown from "react-countdown";
import moment from "moment";
import "primereact/resources/themes/nova-colored/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import PageTitle from "./page-title";

export default class ProblemPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isError: false,

            problem: {
                languagesSupported: [],
                tags: []
            },
            submissions: [],

            subFilter: null,
        };

        this.handleSubChange = this.handleSubChange.bind(this);
    }

    componentDidMount() {
        const contestCode = this.props.location.state.contestCode;
        const problemCode = this.props.location.state.problemCode;

        const queryString = "/api/contests/" + contestCode + "/problems/" + problemCode;

        axios({
            method: "GET",
            url: queryString,
            headers: {
                "Content-Type": "application/json",
            }
        }).then((response) => {
            this.setState({
                problem: response.data.problem.result.data.content,
                submissions: response.data.submissions.result.data.content,
            });
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
    }

    handleSubChange(e) {
        e.preventDefault();

        this.setState({
            subFilter: e.target.value
        });
    }

    render() {
        return (
            <React.Fragment>
                <PageTitle normal="Problem " bold={this.state.problem.problemCode} />
                <div className="container mb-5">
                    <div className="row">
                        <div className="col-12">
                            <div className="card shadow">
                                <div className="card-header">
                                    {this.state.problem.problemName}
                                </div>
                                <div className="card-body">
                                    <div className="card-text" dangerouslySetInnerHTML={{__html: this.state.problem.body}}>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="container mb-5">
                    <div className="row">
                        <div className="col-12 col-lg-6 mb-4 mb-lg-0">
                            <div className="card shadow">
                                <div className="card-header">
                                    Specifications
                                </div>
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item">
                                        <span className="text-muted">Author</span><br/>
                                        <span className="">{this.state.problem.author}</span>
                                    </li>
                                    <li className="list-group-item">
                                        <span className="text-muted">Challenge Type</span><br />
                                        <span>{this.state.problem.challengeType}</span>
                                    </li>
                                    <li className="list-group-item">
                                        <span className="text-muted">Source Size Limit</span><br />
                                        <span>{this.state.problem.sourceSizeLimit} bytes</span>
                                    </li>
                                    <li className="list-group-item">
                                        <span className="text-muted">Time Limit</span><br />
                                        <span>{this.state.problem.maxTimeLimit} seconds</span>
                                    </li>
                                    <li className="list-group-item">
                                        <span className="text-muted">Languages</span><br />
                                        {this.state.problem.languagesSupported.map((lang) => <span className="btn line-blue mb-1 mr-1">{lang}</span>)}
                                    </li>
                                    <li className="list-group-item">
                                        <span className="text-muted">Tags</span><br />
                                        {this.state.problem.tags.map((tag) => <span className="btn line-rust mb-1 mr-1">{tag}</span>)}
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="col-12 col-lg-6">
                            <div className="form-row">
                                <div className="col-7">
                                    <h3 className="section-title">Submissions</h3>
                                </div>
                                <div className="col-5">
                                    <div className="input-group input-group-sm mb-2">
                                        <div className="input-group-prepend">
                                            <div className="input-group-text">
                                                <i className="pi pi-search" />
                                            </div>
                                        </div>
                                        <input type="text" className="form-control w-50" onChange={this.handleSubChange} placeholder="Search" />
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-12">
                                    <DataTable value={this.state.submissions} paginator={true} rows={15} autoLayout={true} globalFilter={this.state.subFilter}>
                                        <Column field="username" header="Username" sortable={true} />
                                        <Column field="result" header="Verdict" sortable={true} />
                                        <Column field="time" header="Time (s)" sortable={true} />
                                        <Column field="memory" header="Memory (bytes)" sortable={true} />
                                    </DataTable>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
        
    }
}