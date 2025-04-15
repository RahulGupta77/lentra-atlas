import React from "react";
import "./DataVerification.scss";
import ChatWindow from "./chat_window/ChatWindow";
import ParsedDataWindow from "./parsed_data_window/ParsedDataWindow";

const DataVerification = () => {
  return (
    <div className="main-content-data-verification">
      <ChatWindow />

      <div className="file-details-box">
        <ParsedDataWindow />
      </div>
    </div>
  );
};

export default DataVerification;
