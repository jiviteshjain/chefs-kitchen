import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import axios from "axios";
import queryString from "query-string";
import { AutoComplete } from "primereact/autocomplete";
import 'primereact/resources/themes/nova-colored/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'

import conf from "../config";
import IllustrImg from "../assets/select-contest.svg";

import PageTitle from "./page-title";
import Error from "./error";
import Loading from "./loading";
import HeadBar from "./head-bar";
import StatusBar from "./status-bar";

export default class SelectContest extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isError: false,
            isLoaded: false,

            fullContestList: [],
            suggestContestList: null,
            selectedContest: null,

            formError: {},
        }

        this.autoComplete = this.autoComplete.bind(this);
        this.handleAutoCompleteChange = this.handleAutoCompleteChange.bind(this);
        this.handleButtonClick = this.handleButtonClick.bind(this);
    }

    componentDidMount() {
        // get contest list
        axios({
            method: "GET",
            url: "/api/contests/all",
            headers: {
                'Content-Type': 'application/json',
            }
        }).then((response) => {
            console.log(response.data);
            const contestList = response.data.result.data.content.contestList;
            for (let contest of contestList) {
                contest.extendedName = contest.code + " - " + contest.name;
            }
            this.setState({
                fullContestList: contestList,
                isLoaded: true,
            });
            console.log(contestList);
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

    handleAutoCompleteChange(e) {
        e.preventDefault();
        this.setState({
            selectedContest: e.value,
        });
    }

    autoComplete(e) {
        
        const results = this.state.fullContestList.filter((contest) => {
            return (contest.name.toLowerCase().startsWith(e.query.toLowerCase()) || contest.code.toLowerCase().startsWith(e.query.toLowerCase()));
        });

        this.setState({
            suggestContestList: results,
        });

    }

    handleButtonClick(e) {
        e.preventDefault()

        if (this.state.selectedContest == null) {
            const formError = Object.assign({}, this.state.formError);
            formError["contest"] = "Please select a contest."
            this.setState({
                formError: formError,
            });
            return;
        }

        this.props.history.push({
            pathname: "/contest",
            state: {
                contest: this.state.selectedContest,
            },
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

        return (
            <React.Fragment>
                <HeadBar/>
                <StatusBar/>
                <PageTitle normal="Choose a " bold="Contest" />
                <div className="container">
                    <div className="row">
                        <div className="col-12 d-flex justify-content-center align-items-center">
                            <img src={IllustrImg} height="200" className="img my-5" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12 d-flex justify-content-center align-items-center flex-column">
                            <AutoComplete
                                field="extendedName"
                                value={this.state.selectedContest}
                                onChange={this.handleAutoCompleteChange}
                                suggestions={this.state.suggestContestList}
                                completeMethod={this.autoComplete}
                                dropdown={true}
                                dropdownMode="blank" 
                                placeholder="Select Contest"
                            />
                            {
                                this.state.formError.contest &&
                                <p className="form-error">{this.state.formError.contest}</p>
                            }
                        </div>
                    </div>
                    <div className="row mt-4">
                        <div className="col-12 d-flex justify-content-center align-items-center">
                            <button onClick={this.handleButtonClick} className="btn line-blue shadow-move w-25">Go</button>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}