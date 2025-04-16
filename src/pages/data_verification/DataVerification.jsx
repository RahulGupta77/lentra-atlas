import React from "react";
import { Sidebar } from "../../components/Sidebar";
import "./DataVerification.scss";
import ChatWindow from "./chat_window/ChatWindow";
import ParsedDataWindow from "./parsed_data_window/ParsedDataWindow";

const DataVerification = () => {
  return (
    <div className="main-content-data-verification">
      <Sidebar />

      <ChatWindow />

      <div className="file-details-box">
        <ParsedDataWindow />
      </div>
    </div>
  );
};

export default DataVerification;
