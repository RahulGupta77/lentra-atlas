import React, { useState } from "react";
import { Sidebar } from "../../components/Sidebar";
import ParsedDataWindow from "./parsed_loan_window/ParsedDataWindow";
import "./LAP_Documents.scss";

const LAPDocuments = () => {
  const [updateDocStatusTrigger, setUpdateDocStatusTrigger] = useState(false);

  return (
    <div className="lap-documents">
      <Sidebar />

      <div className="main-content">
        <div className="file-details-box">
          <ParsedDataWindow updateDocStatusTrigger={updateDocStatusTrigger} />
        </div>
      </div>
    </div>
  );
};

export default LAPDocuments;
