import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import axios from "axios";
import queryString from "query-string";
import { DataTable, Column } from 'primereact/datatable';
import { Dropdown } from 'primereact/dropdown';
import Countdown from "react-countdown";
import moment from "moment";
import Editor from "react-simple-code-editor"
import "primereact/resources/themes/nova-colored/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";


import PageTitle from "./page-title";
import Error from "./error";
import Loading from "./loading";

export default class ProblemPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isError: false,
            isLoaded: false,

            problem: {
                languagesSupported: [],
                tags: []
            },
            submissions: [],

            subFilter: null,
            
            codeText: "",
            selectedLanguage: null,
            codeInput: null,
            codeOutput: null,
            isRunning: false,
            chefLink: null,
            runResult: null
        };

        this.handleSubChange = this.handleSubChange.bind(this);
        this.handleEditorChange = this.handleEditorChange.bind(this);
        this.handleLanguageChange = this.handleLanguageChange.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleRun = this.handleRun.bind(this);
        this.pollRun = this.pollRun.bind(this);
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

    handleSubChange(e) {
        e.preventDefault();

        this.setState({
            subFilter: e.target.value
        });
    }

    handleEditorChange(code) {
        this.setState({
            codeText: code
        });
    }

    handleInputChange(e) {
        this.setState({
            codeInput: e.target.value
        });
    }

    handleLanguageChange(e) {
        this.setState({
            selectedLanguage: e.value
        });
    }

    handleRun(e) {
        alert("Your code is running! Please wait while we finish cooking.");
        axios({
            method: "POST",
            url: "/api/ide/run",
            headers: {
                "Content-Type": "application/json",
            },
            data: {
                code: this.state.codeText,
                lang: this.state.selectedLanguage,
                input: this.state.codeInput
            }
        }).then((response) => {
            this.setState({
                isRunning: true,
                chefLink: response.data.result.data.link
            });
            setTimeout(() => {this.pollRun()}, 5000);
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

    pollRun() {
        if (!this.state.isRunning) {
            return;
        }

        axios({
            method: "POST",
            url: "/api/ide/status",
            headers: {
                "Content-Type": "application/json",
            },
            data: {
                link: this.state.chefLink
            }
        }).then((response) => {
            console.log(response);
            this.setState({
                runResult: response.data.result.data,
                codeOutput: response.data.result.data.output,
                isRunning: false
            })
        }).catch({
            if(error) {
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

    handleSubmit(e) {
        e.preventDefault();
        alert("Your code has been submitted!");
    }

    render() {

        if (this.state.isError) {
            return (
                <Error />
            );
        }

        if (!this.state.isLoaded) {
            return (
                <Loading />
            )
        }

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

                <div className="container">
                    <div className="row">
                        <div className="col-12 text-center">
                            <h3 className="section-title">IDE</h3>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12 col-lg-6 mb-5 mb-lg-0">
                            <div className="container_editor_area">
                                <Editor
                                    value={this.state.codeText}
                                    onValueChange={this.handleEditorChange}
                                    highlight={code => { return code; }}
                                    padding={10}
                                    style={{
                                        fontFamily: 'monospace',
                                        fontSize: 12,
                                        wordWrap: "normal",
                                        whiteSpace: "nowrap"
                                    }}
                                    className="container__editor"
                                    placeholder="# Get set code"
                                />
                            </div>
                        </div>

                        <div className="col-12 col-lg-6 side-box">
                            <div className="row my-2">
                                <div className="col-12 d-flex justify-content-center">
                                    <Dropdown value={this.state.selectedLanguage} options={this.state.problem.languagesSupported} onChange={this.handleLanguageChange} placeholder="Select language" />
                                </div>
                            </div>
                            <div className="row my-2">
                                <div className="col-12">
                                    <textarea className="form-control" rows="3" placeholder="Custom Input" value={this.state.codeInput} onChange={this.handleInputChange}/>
                                </div>
                            </div>
                            <div className="row my-2">
                                <div className="col-12">
                                    <textarea className="form-control" readOnly={true} rows="3" placeholder="Output" value={this.state.codeOutput}/>
                                </div>
                            </div>
                            <div className="row my-2">
                                <div className="col-6 text-center">
                                    <button className="btn bg-yellow shadow-move w-50" onClick={this.handleRun}>Run</button>
                                </div>
                                <div className="col-6 text-center">
                                    <button className="btn bg-rust shadow-move w-50" onClick={this.handleSubmit}>Submit</button>
                                </div>
                            </div>
                            {
                                this.state.runResult &&
                                <div className="card shadow">
                                    <div className="card-header">
                                        Run Details
                                </div>
                                    <ul className="list-group list-group-flush">
                                        <li className="list-group-item">
                                            <span className="text-muted">Time</span><br />
                                            <span className="">{this.state.runResult.time}</span>
                                        </li>
                                        <li className="list-group-item">
                                            <span className="text-muted">Memory</span><br />
                                            <span>{this.state.runResult.memory}</span>
                                        </li>
                                        <li className="list-group-item">
                                            <span className="text-muted">Signal</span><br />
                                            <span>{this.state.runResult.signal}</span>
                                        </li>
                                        <li className="list-group-item">
                                            <span className="text-muted">Standard Error</span><br />
                                            <span>{this.state.runResult.stderr}</span>
                                        </li>
                                        <li className="list-group-item">
                                            <span className="text-muted">CMP Information</span><br />
                                            <span>{this.state.runResult.cmpinfo}</span>
                                        </li>
                                    </ul>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
        
    }
}