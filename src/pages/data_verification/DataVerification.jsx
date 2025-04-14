import React from "react";
import "./DataVerification.scss";
import ChatWindow from "./chat_window/ChatWindow";

const DataVerification = () => {
  return (
    <div className="main-content-data-verification">
      <div className="chat-window-box">
        <ChatWindow />
      </div>

      <div className="file-details-box"></div>
    </div>
  );
};

export default DataVerification;
