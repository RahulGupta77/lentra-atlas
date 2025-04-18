import React, { useState } from "react";
import { Sidebar } from "../../components/Sidebar";
import "./DataVerification.scss";
import ChatWindow from "./chat_window/ChatWindow";
import DocumentChecklist from "./document_checklist/DocumentChecklist";
import ParsedDataWindow from "./parsed_data_window/ParsedDataWindow";

const DataVerification = () => {
  const [updateDocStatusTrigger, setUpdateDocStatusTrigger] = useState(false);

  return (
    <div className="main-content-data-verification">
      <Sidebar />

      <div className="main-content-data-verification-subbox">
        <DocumentChecklist updateDocStatusTrigger={updateDocStatusTrigger} />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <ChatWindow setUpdateDocStatusTrigger={setUpdateDocStatusTrigger} />

          <div className="file-details-box">
            <ParsedDataWindow />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataVerification;
