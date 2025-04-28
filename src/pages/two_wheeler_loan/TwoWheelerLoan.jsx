import React, { useState } from "react";
import { Sidebar } from "../../components/Sidebar";
import ParsedDataWindow from "./parsed_loan_window/ParsedDataWindow";
import "./TwoWheelerLoan.scss";

const TwoWheelerLoan = () => {
  const [updateDocStatusTrigger, setUpdateDocStatusTrigger] = useState(false);

  return (
    <div className="loan-content-data-verification">
      <Sidebar />

      <div className="main-content">
        <div className="file-details-box">
          <ParsedDataWindow updateDocStatusTrigger={updateDocStatusTrigger} />
        </div>
      </div>
    </div>
  );
};

export default TwoWheelerLoan;
