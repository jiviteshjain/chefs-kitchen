import React from "react";

export default class PageTitle extends React.Component {
  render() {
    return (
      <div className="container my-5">
        <div className="row my-5">
          <div className="col-12 text-center text-md-right">
            <h1 className="page-title">
              {this.props.normal}
              <b>{this.props.bold}</b>
            </h1>
          </div>
        </div>
      </div>
    );
  }
}
