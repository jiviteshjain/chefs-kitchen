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

export default class SelectContest extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isError: false,

            fullContestList: [],
            suggestContestList: null,
            selectedContest: null
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
                fullContestList: contestList 
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

        this.props.history.push({
            pathname: "/contest",
            state: {
                contest: this.state.selectedContest,
            },
        });
    }

    render() {
        return (
            <React.Fragment>
                <PageTitle normal="Choose a " bold="Contest" />
                <div className="container">
                    <div className="row">
                        <div className="col-12 d-flex justify-content-center align-items-center">
                            <img src={IllustrImg} height="200" className="img my-5" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12 d-flex justify-content-center align-items-center">
                            <AutoComplete
                                field="extendedName"
                                value={this.state.selectedContest}
                                onChange={this.handleAutoCompleteChange}
                                suggestions={this.state.suggestContestList}
                                completeMethod={this.autoComplete}
                                dropdown={true}
                                dropdownMode="current"
                            />
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