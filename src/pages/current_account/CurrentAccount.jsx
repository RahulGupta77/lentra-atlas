import React from "react";
import { Sidebar } from "../../components/Sidebar";
import "./CurrentAccount.scss";
import ParsedDataWindow from "./parsed_current_account/ParsedDataWindow";

const CurrentAccount = () => {
  return (
    <div className="current-account">
      <Sidebar />

      <div className="main-content">
        <div className="file-details-box">
          <ParsedDataWindow />
        </div>
      </div>
    </div>
  );
};

export default CurrentAccount;
