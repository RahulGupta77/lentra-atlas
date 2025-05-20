import React from "react";
import "./DocumentViewer.scss";

const DocumentViewer = ({ documents }) => {
  return (
    <div className="document-container">
      {documents.map((doc, index) => (
        <div key={index} className="document-box">
          <h3 className="document-type">
            {doc.document_type || "Untitled Document"}
          </h3>
          <div className="meta-data">
            {Object.entries(doc.meta_data).map(([field, data]) => (
              <div key={field} className="field-box">
                <label>{field.replace(/_/g, " ").toUpperCase()}</label>
                <div className="input-group">
                  <input
                    type="text"
                    value={data.value || ""}
                    readOnly
                    className="read-only-input"
                  />
                  <span className="confidence">
                    {data.confidence_score
                      ? `${(data.confidence_score * 100).toFixed(2)}%`
                      : "N/A"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentViewer;
