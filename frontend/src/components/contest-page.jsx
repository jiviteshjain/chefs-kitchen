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


import conf from "../config";
import PageTitle from "./page-title";
import Error from "./error";
import Loading from "./loading";

export default class ContestPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

            isError: false,
            isLoaded: false,

            submissions: [],
            contest: {},
            ranks: [],
            problemList: [],

            rankFilter: null,
            subFilter: null,
        }

        this.handleRankChange = this.handleRankChange.bind(this);
        this.handleSubChange = this.handleSubChange.bind(this);
    }

    componentDidMount() {
        const contestCode = this.props.location.state.contest.code;
        const queryString = "/api/contests/detail/" + contestCode;
        axios({
            method: "GET",
            url: queryString,
            headers: {
                "Content-Type": "application/json",
            }
        }).then((response) => {
            this.setState({
                submissions: response.data.submissions.result.data.content,
                contest: response.data.contest.result.data.content,
                ranks: response.data.ranks.result.data.content,
                problemList: response.data.contest.result.data.content.problemsList,
                isLoaded: true,
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

    handleRankChange(e) {
        e.preventDefault();

        this.setState({
            rankFilter: e.target.value
        });
    }
    handleSubChange(e) {
        e.preventDefault();

        this.setState({
            subFilter: e.target.value
        });
    }

    render() {

        if (this.state.isError) {
            return (
                <Error/>
            );
        }

        if (!this.state.isLoaded) {
            return (
                <Loading/>
            )
        }

        const problemList = this.state.problemList.map((prob, i) => {
            return (
                <div className="card shadow-move my-1">
                    <div className="card-body">
                        <h4 className="card-title">{prob.problemCode}</h4>
                        <p className="card-text">
                            <b>Successful Submissions: </b>{prob.successfulSubmissions}<br/>
                            <b>Accuracy: </b>{prob.accuracy}<br />
                        </p>
                        <hr/>
                        <Link to={{
                            pathname: "/problem",
                            state: {
                                contestCode:prob.contestCode,
                                problemCode: prob.problemCode
                            }
                        }} className="btn shadow-move bg-yellow">Try Now</Link>

                    </div>
                </div>
            );
        });

        const startDate = moment(this.state.contest.startDate).format('MMMM Do YYYY, h:mm:ss a');
        const endDate = moment(this.state.contest.endDate).format('MMMM Do YYYY, h:mm:ss a');
        return (
            <React.Fragment>
                <PageTitle normal="Contest " bold={this.state.contest.code} />
                <div className="container mb-5">
                    <div className="row">
                        <div className="col-12">
                            <div className="card shadow">
                                <div className="card-header">
                                    {this.state.contest.code}
                                </div>
                                <div className="card-body">
                                    <h3 className="card-title">{this.state.contest.name}</h3>
                                    <div className="card-text text-center">
                                        <Countdown date={moment(this.state.contest.endDate).format()} />
                                    </div>
                                    
                                </div>
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item"><b>Starts: </b>{startDate}</li>
                                    <li className="list-group-item"><b>Ends: </b>{endDate}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="container mb-5">
                    <div className="row">
                        <div className="col-12 text-center">
                            <h3 className="section-title">Problems</h3>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            {problemList}
                        </div>
                    </div>
                </div>
                <div className="container mb-5">
                    <div className="row">
                        <div className="col-12 col-lg-6 mb-4 mb-lg-0">
                            {/* <table className="table table-striped table-hover">
                                <thead className="bg-rust">
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Username</th>
                                        <th scope="col">Country</th>
                                        <th scope="col">Total Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                        {rankTable}
                                </tbody>
                            </table> */}
                            <div className="form-row">
                                <div className="col-7">
                                    <h3 className="section-title">Ranklist</h3>
                                </div>
                                <div className="col-5">
                                    <div className="input-group input-group-sm mb-2">
                                        <div className="input-group-prepend">
                                            <div className="input-group-text">
                                                <i className="pi pi-search"/>
                                            </div>
                                        </div>
                                        <input type="text" className="form-control w-50" onChange={this.handleRankChange} placeholder="Search"/>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-12">
                                    <DataTable value={this.state.ranks} paginator={true} rows={10} autoLayout={true} globalFilter={this.state.rankFilter}>
                                        <Column field="rank" header="#" sortable={true} />
                                        <Column field="username" header="Username" sortable={true} />
                                        <Column field="country" header="Country" sortable={true} />
                                        <Column field="totalScore" header="Total Score" sortable={true} />
                                    </DataTable>
                                </div>
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
                                    <DataTable value={this.state.submissions} paginator={true} rows={10} autoLayout={true} globalFilter={this.state.subFilter}>
                                        <Column field="problemCode" header="Problem" sortable={true} />
                                        <Column field="username" header="Username" sortable={true} />
                                        <Column field="result" header="Verdict" sortable={true} />
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