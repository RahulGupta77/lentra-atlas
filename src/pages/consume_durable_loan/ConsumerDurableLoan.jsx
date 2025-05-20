import React from "react";
import { Sidebar } from "../../components/Sidebar";
import "./ConsumerDurableLoan.scss";
import ParsedDataWindow from "./parsed_consumer_loan/ParsedDataWindow";

const ConsumerDurableLoan = () => {
  return (
    <div className="consumer-durable-loan">
      <Sidebar />

      <div className="main-content">
        <div className="file-details-box">
          <ParsedDataWindow />
        </div>
      </div>
    </div>
  );
};

export default ConsumerDurableLoan;
